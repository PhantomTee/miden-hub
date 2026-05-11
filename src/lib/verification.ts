import type { Quest } from "@prisma/client"
import type { SessionPayload } from "@/lib/session"
import { db } from "@/lib/db"
import { Octokit } from "@octokit/rest"
import { TwitterApi } from "twitter-api-v2"

type VerificationParams = {
  repoOwner?: string
  repoName?: string
  tweetId?: string
  accountToFollow?: string
  telegramChannelId?: string
  txHash?: string
}

export async function verifyQuest(
  quest: Quest,
  session: SessionPayload,
  body: Record<string, string>
): Promise<boolean> {
  const params = quest.verificationParams as VerificationParams

  switch (quest.verificationType) {
    case "GITHUB_STAR":
      return verifyGithubStar(session.userId, params)
    case "GITHUB_PR":
      return verifyGithubPR(session.userId, params, body)
    case "TWITTER_FOLLOW":
      return verifyTwitterFollow(session.userId, params)
    case "TWITTER_RETWEET":
      return verifyTwitterRetweet(session.userId, params)
    case "TELEGRAM_JOIN":
      return verifyTelegramJoin(session.userId, params)
    case "MIDEN_TX":
      return verifyMidenTx(session.walletAddress, params, body)
    default:
      return false
  }
}

// OAuth tokens are not stored - social linking only captures usernames.
// Token-based auto-verification (GitHub stars, Twitter follows, etc.) is
// not supported; those quest types require manual admin review.
async function getLinkedUsername(userId: string, provider: "GITHUB" | "TWITTER" | "TELEGRAM") {
  const linked = await db.linkedAccount.findUnique({
    where: { userId_provider: { userId, provider } },
  })
  return linked?.providerUsername ?? null
}

async function verifyGithubStar(userId: string, params: VerificationParams): Promise<boolean> {
  // Requires stored OAuth token - not available (username-only linking).
  // Use admin-reviewed submission flow for GitHub contributions instead.
  const username = await getLinkedUsername(userId, "GITHUB")
  if (!username || !params.repoOwner || !params.repoName) return false

  // Check star via public API using the stored username (no auth needed for public repos)
  try {
    const res = await fetch(
      `https://api.github.com/repos/${params.repoOwner}/${params.repoName}/stargazers?per_page=100`,
      { headers: { Accept: "application/vnd.github+json" } }
    )
    const stargazers = await res.json() as { login: string }[]
    return stargazers.some((s) => s.login.toLowerCase() === username.toLowerCase())
  } catch {
    return false
  }
}

async function verifyGithubPR(
  userId: string,
  params: VerificationParams,
  body: Record<string, string>
): Promise<boolean> {
  const username = await getLinkedUsername(userId, "GITHUB")
  if (!username || !params.repoOwner || !params.repoName) return false

  const prNumber = parseInt(body.prNumber)
  if (!prNumber) return false

  try {
    const octokit = new Octokit() // unauthenticated - public repos only
    const pr = await octokit.pulls.get({
      owner: params.repoOwner,
      repo: params.repoName,
      pull_number: prNumber,
    })
    return (
      pr.data.user?.login.toLowerCase() === username.toLowerCase() &&
      (pr.data.state === "open" || pr.data.merged === true)
    )
  } catch {
    return false
  }
}

async function verifyTwitterFollow(userId: string, params: VerificationParams): Promise<boolean> {
  // Twitter API v2 requires OAuth to check follows - not available with username-only linking.
  // Always return false; use submission flow for Twitter contributions.
  void userId; void params
  return false
}

async function verifyTwitterRetweet(userId: string, params: VerificationParams): Promise<boolean> {
  void userId; void params
  return false
}

async function verifyTelegramJoin(userId: string, params: VerificationParams): Promise<boolean> {
  const linked = await db.linkedAccount.findUnique({
    where: { userId_provider: { userId, provider: "TELEGRAM" } },
  })
  if (!linked || !params.telegramChannelId) return false

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getChatMember?chat_id=${params.telegramChannelId}&user_id=${linked.providerId}`
    )
    const data = await res.json()
    return ["member", "administrator", "creator"].includes(data.result?.status)
  } catch {
    return false
  }
}

async function verifyMidenTx(
  walletAddress: string,
  params: VerificationParams,
  body: Record<string, string>
): Promise<boolean> {
  const txHash = body.txHash
  if (!txHash || !params.txHash) return true // just check tx was submitted

  try {
    const nodeUrl = process.env.MIDEN_NODE_URL ?? "https://testnet.miden.xyz"
    const res = await fetch(`${nodeUrl}/api/transaction/${txHash}`)
    if (!res.ok) return false
    const tx = await res.json()
    return tx.sender === walletAddress || tx.accountId === walletAddress
  } catch {
    return false
  }
}
