import { SubmissionCategory } from "@prisma/client"

export const SUBMISSION_CATEGORIES: {
  value: SubmissionCategory
  label: string
  description: string
  defaultPoints: number
  linkLabel: string
  linkPlaceholder: string
}[] = [
  {
    value: "TWEET",
    label: "Tweet / X Post",
    description: "Share a post about Miden on X (Twitter)",
    defaultPoints: 50,
    linkLabel: "Link to tweet",
    linkPlaceholder: "https://x.com/yourhandle/status/...",
  },
  {
    value: "DAPP",
    label: "Build a dApp",
    description: "A dApp, tool, or project built on Miden",
    defaultPoints: 500,
    linkLabel: "Link to repo or live app",
    linkPlaceholder: "https://github.com/you/miden-project",
  },
  {
    value: "ARTICLE",
    label: "Article / Blog Post",
    description: "Technical write-up, tutorial, or ecosystem post about Miden",
    defaultPoints: 200,
    linkLabel: "Link to article",
    linkPlaceholder: "https://medium.com/...",
  },
  {
    value: "VIDEO",
    label: "Video / Tutorial",
    description: "YouTube, Loom, or any video content about Miden",
    defaultPoints: 150,
    linkLabel: "Link to video",
    linkPlaceholder: "https://youtube.com/watch?v=...",
  },
]

export const DEFAULT_POINTS: Record<SubmissionCategory, number> = {
  TWEET: 50,
  DAPP: 500,
  ARTICLE: 200,
  VIDEO: 150,
}
