export type ProfileForCompletion = {
  username: string | null
  bio: string | null
  avatarUrl: string | null
  website: string | null
  linkedAccountCount: number
}

export type CompletionItem = {
  label: string
  done: boolean
  points: number
}

export function getCompletionItems(profile: ProfileForCompletion): CompletionItem[] {
  return [
    { label: "Wallet connected", done: true, points: 20 },
    { label: "Set a username", done: !!profile.username, points: 30 },
    { label: "Write a bio", done: !!profile.bio, points: 25 },
    { label: "Link a social account", done: profile.linkedAccountCount > 0, points: 15 },
    { label: "Add an avatar", done: !!profile.avatarUrl, points: 10 },
  ]
}

export function getCompletionScore(profile: ProfileForCompletion): number {
  return getCompletionItems(profile).reduce((sum, item) => sum + (item.done ? item.points : 0), 0)
}

export const COMPLETION_THRESHOLD = 70
