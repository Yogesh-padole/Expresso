export const currentUser = {
  id: "u1",
  name: "Sarah Chen",
  avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=sarah",
  bio: "Writer, thinker, coffee lover ☕ Sharing lessons learned the hard way.",
  stats: { posts: 42, likes: 318, comments: 156 },
};

export const users = [
  currentUser,
  {
    id: "u2",
    name: "Marcus Rivera",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=marcus",
    bio: "Traveler & storyteller",
    stats: { posts: 28, likes: 210, comments: 89 },
  },
  {
    id: "u3",
    name: "Aisha Patel",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=aisha",
    bio: "Learning every day",
    stats: { posts: 15, likes: 95, comments: 44 },
  },
  {
    id: "u4",
    name: "James Kim",
    avatar: "https://api.dicebear.com/8.x/avataaars/svg?seed=james",
    bio: "Developer & philosopher",
    stats: { posts: 63, likes: 420, comments: 201 },
  },
];

export const mockPosts = [
  {
    id: "p1",
    author: users[1],
    title: "Learning to Say No",
    content: `Today I learned that saying "no" is one of the most powerful forms of self-care — something I never truly understood until recently.

For years, I was a people pleaser. I said yes to everything — extra work, social commitments, favors — even when I was exhausted. I believed that being available for everyone made me a better person. But slowly, I started losing myself in the process. My energy drained, my focus scattered, and my happiness depended on others.

This week, something changed. I was offered a project that looked good on paper but didn’t align with my values or goals. For the first time, I paused. I reflected. And then… I said no.

It felt uncomfortable at first. Almost like I was doing something wrong. But moments later, I felt something unexpected — relief. A quiet sense of control. Like I had finally chosen myself.

Maybe growth isn’t about doing more. Maybe it’s about choosing better.

And today, I chose myself.`,
    tags: ["self-care", "growth", "boundaries"],
    likes: 48,
    liked: false,
    saved: false,
    commentCount: 12,
    createdAt: "2h ago",
    isAnonymous: false,
  },

  {
    id: "p2",
    author: null,
    title: "Imposter Syndrome at Work",
    content: `I’ve been struggling with imposter syndrome at my new job, and it’s been harder than I expected.

Every morning I walk into the office, I feel like I’m pretending to be someone I’m not. Everyone around me seems so confident — they speak clearly, make decisions quickly, and carry themselves like they belong. Meanwhile, I second-guess everything I do.

Even small tasks feel overwhelming. I recheck emails multiple times before sending them. I hesitate to ask questions because I’m afraid it will reveal how much I don’t know.

The strange part is — no one has said anything negative to me. In fact, people have been supportive. But the voice in my head is louder than any reassurance.

Maybe this is just part of growing. Maybe everyone feels like this at some point but doesn’t talk about it.

I’m writing this anonymously because I’m not ready to say it out loud yet… but I needed to say it somewhere.`,
    tags: ["career", "mental-health", "vulnerability"],
    likes: 124,
    liked: true,
    saved: true,
    commentCount: 34,
    createdAt: "4h ago",
    isAnonymous: true,
  },

  {
    id: "p3",
    author: users[2],
    title: "A diaryEntries That Changed My Perspective",
    content: `My grandmother passed away last month, and while going through her belongings, I found something unexpected — a diaryEntries she had been writing for over 40 years.

At first, I hesitated to open it. It felt personal. But curiosity got the better of me.

As I flipped through the pages, I realized something incredible. Her thoughts, her fears, her dreams — they were so similar to mine. She wrote about uncertainty in her twenties, about relationships, about purpose. The same questions I ask myself today.

It was surreal. Time suddenly felt less linear.

We often think our struggles are unique, but maybe they aren’t. Maybe every generation faces the same emotional battles, just in different forms.

That diaryEntries didn’t just tell me about her life — it reminded me that I’m not alone in mine.`,
    tags: ["family", "grief", "perspective"],
    likes: 89,
    liked: false,
    saved: false,
    commentCount: 21,
    createdAt: "6h ago",
    isAnonymous: false,
  },

  {
    id: "p4",
    author: null,
    title: "Forgiving Without an Apology",
    content: `I forgave someone today who never apologized.

For a long time, I believed forgiveness required closure — a conversation, an explanation, or at least an acknowledgment. But that moment never came.

Instead, I carried the resentment with me. Every memory, every thought, every reminder — it all weighed me down.

Today, I decided to let go. Not because they deserved it, but because I did.

Forgiveness, I realized, isn’t about the other person. It’s about freeing yourself from the burden of holding on.

And when I finally let go, I felt lighter. Not instantly happy, not magically healed — but lighter.

Sometimes healing is quiet. And sometimes, it starts within.`,
    tags: ["forgiveness", "healing", "letting-go"],
    likes: 203,
    liked: false,
    saved: false,
    commentCount: 45,
    createdAt: "8h ago",
    isAnonymous: true,
  },

  {
    id: "p5",
    author: users[3],
    title: "30 Days of diaryEntriesing – Day 7",
    content: `I started a 30-day diaryEntriesing challenge, and today is Day 7.

At first, I didn’t think much of it. Just writing random thoughts every night. But something interesting started happening.

Patterns began to emerge.

I noticed how often I worried about things that never actually happened. I saw recurring thoughts that I wasn’t even aware of during the day.

diaryEntriesing became more than just writing — it became reflection.

Now, it’s something I look forward to. A quiet moment where I can pause, think, and understand myself a little better.

If you ever feel stuck or overwhelmed, try writing. You might discover things you didn’t even know were inside you.`,
    tags: ["diaryEntriesing", "habits", "clarity"],
    likes: 67,
    liked: false,
    saved: true,
    commentCount: 8,
    createdAt: "12h ago",
    isAnonymous: false,
  },
];

export const mockComments = [
  {
    id: "c1",
    author: users[2],
    isAnonymous: false,
    text: "This really resonates with me. I went through something similar last year and learning to set boundaries changed my life completely.",
    likes: 12,
    liked: false,
    createdAt: "1h ago",
    replies: [
      {
        id: "c1r1",
        author: users[3],
        isAnonymous: false,
        text: "@Aisha Same here! It's amazing how much energy we waste trying to please everyone.",
        likes: 5,
        liked: false,
        createdAt: "45m ago",
        replies: [],
      },
      {
        id: "c1r2",
        author: null,
        isAnonymous: true,
        text: "I wish I could do this but I'm terrified of disappointing people. Any tips?",
        likes: 8,
        liked: true,
        createdAt: "30m ago",
        replies: [],
      },
    ],
  },
  {
    id: "c2",
    author: null,
    isAnonymous: true,
    text: "You're not alone in feeling this way. I think most people experience this but nobody talks about it. Thank you for sharing.",
    likes: 24,
    liked: false,
    createdAt: "2h ago",
    replies: [],
  },
  {
    id: "c3",
    author: users[0],
    isAnonymous: false,
    text: "Beautiful perspective. I think writing helps us process emotions in ways that thinking alone can't. Keep going! 💛",
    likes: 7,
    liked: false,
    createdAt: "3h ago",
    replies: [],
  },
];

export const trendingTags = [
  { name: "self-care", count: 234 },
  { name: "growth", count: 198 },
  { name: "career", count: 167 },
  { name: "relationships", count: 145 },
  { name: "collegevibes", count: 132 },
  { name: "friendshipgoals", count: 98 },
  { name: "habits", count: 87 },
  { name: "creativity", count: 76 },
];

export const mockNotifications = [
  {
    id: "n1",
    type: "like",
    message: "Marcus liked your post about diaryEntriesing",
    time: "5m ago",
    read: false,
  },
  {
    id: "n2",
    type: "comment",
    message: "Aisha commented on your experience",
    time: "15m ago",
    read: false,
  },
  {
    id: "n3",
    type: "reply",
    message: "Someone replied to your comment",
    time: "1h ago",
    read: false,
  },
  {
    id: "n4",
    type: "follow",
    message: "James started following you",
    time: "2h ago",
    read: true,
  },
  {
    id: "n5",
    type: "like",
    message: "12 people liked your anonymous post",
    time: "3h ago",
    read: true,
  },
];
