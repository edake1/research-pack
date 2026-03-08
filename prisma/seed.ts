import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data for clean re-seed
  await prisma.thanks.deleteMany()
  await prisma.takeaway.deleteMany()
  await prisma.source.deleteMany()
  await prisma.researchPack.deleteMany()
  await prisma.user.deleteMany()

  // Create sample users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Sarah Chen',
        email: 'sarah@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        bio: 'AI researcher and PhD candidate at MIT. Passionate about making research accessible.'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Marcus Johnson',
        email: 'marcus@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
        bio: 'Climate scientist studying carbon capture technologies. Open science advocate.'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Elena Rodriguez',
        email: 'elena@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
        bio: 'Space enthusiast and aerospace engineer. Building the future of space exploration.'
      }
    })
  ])

  console.log('Created users:', users.map(u => u.name).join(', '))

  // Create sample research packs
  const packs = await Promise.all([
    prisma.researchPack.create({
      data: {
        title: 'Introduction to Large Language Models',
        description: 'A comprehensive guide to understanding how large language models work, from transformers to fine-tuning. This pack covers the fundamentals for anyone starting their journey into LLMs.',
        topic: 'Artificial Intelligence',
        tags: 'LLM, AI, Machine Learning, NLP, Transformers',
        creatorId: users[0].id,
        viewCount: 245,
        thanksCount: 42,
        forkCount: 8,
        sources: {
          create: [
            {
              url: 'https://arxiv.org/abs/1706.03762',
              title: 'Attention Is All You Need (Original Transformer Paper)',
              type: 'paper',
              notes: 'The foundational paper that introduced the transformer architecture. Essential reading for understanding modern LLMs.',
              relevanceRating: 5
            },
            {
              url: 'https://jalammar.github.io/illustrated-transformer/',
              title: 'The Illustrated Transformer',
              type: 'article',
              notes: 'An excellent visual guide to understanding transformers. Great companion to the original paper.',
              relevanceRating: 5
            },
            {
              url: 'https://www.youtube.com/watch?v=kCc8FmEb1nY',
              title: 'Let\'s build GPT: from scratch, in code, spelled out',
              type: 'video',
              notes: 'Andrej Karpathy walks through building a GPT from scratch. Perfect for understanding the implementation details.',
              relevanceRating: 5
            },
            {
              url: 'https://www.deeplearning.ai/courses/',
              title: 'DeepLearning.AI Courses',
              type: 'article',
              notes: 'Andrew Ng\'s courses on deep learning and NLP. Great structured learning path.',
              relevanceRating: 4
            }
          ]
        },
        takeaways: {
          create: [
            { content: 'Transformers revolutionized NLP by enabling parallel processing of sequences, unlike RNNs.', order: 0 },
            { content: 'The attention mechanism allows models to focus on relevant parts of the input when generating output.', order: 1 },
            { content: 'Scale matters - larger models with more parameters and data consistently perform better.', order: 2 },
            { content: 'Fine-tuning pretrained models is more efficient than training from scratch for most applications.', order: 3 }
          ]
        }
      }
    }),
    prisma.researchPack.create({
      data: {
        title: 'Carbon Capture Technology Overview',
        description: 'Everything you need to understand about carbon capture, utilization, and storage (CCUS). From basic principles to cutting-edge developments in the field.',
        topic: 'Climate Science',
        tags: 'Climate, Carbon Capture, Sustainability, Environment, CCUS',
        creatorId: users[1].id,
        viewCount: 189,
        thanksCount: 31,
        forkCount: 5,
        sources: {
          create: [
            {
              url: 'https://www.iea.org/reports/carbon-capture-utilisation-and-storage-2',
              title: 'IEA Report on Carbon Capture',
              type: 'article',
              notes: 'Comprehensive overview from the International Energy Agency. Great for understanding the global landscape.',
              relevanceRating: 5
            },
            {
              url: 'https://www.nature.com/articles/s41586-022-05324-1',
              title: 'Direct Air Capture: A Review of Technologies',
              type: 'paper',
              notes: 'Academic review of DAC technologies. Technical but thorough.',
              relevanceRating: 4
            },
            {
              url: 'https://www.youtube.com/watch?v=IWn-wEV5MJA',
              title: 'How Carbon Capture Works',
              type: 'video',
              notes: 'Accessible video explanation of different carbon capture methods.',
              relevanceRating: 4
            },
            {
              url: 'https://climeworks.com/direct-air-capture',
              title: 'Climeworks - Direct Air Capture',
              type: 'article',
              notes: 'Leading company in DAC space. Good for understanding commercial applications.',
              relevanceRating: 3
            }
          ]
        },
        takeaways: {
          create: [
            { content: 'Three main types: post-combustion, pre-combustion, and oxy-fuel combustion capture.', order: 0 },
            { content: 'Direct Air Capture (DAC) can remove CO2 directly from atmosphere but is energy-intensive.', order: 1 },
            { content: 'Cost is the main barrier - currently $100-600/ton CO2, needs to drop below $100 for wide adoption.', order: 2 },
            { content: 'Storage options include geological formations, ocean storage, and mineralization.', order: 3 }
          ]
        }
      }
    }),
    prisma.researchPack.create({
      data: {
        title: 'SpaceX Starship Development',
        description: 'A curated collection of resources tracking the development of SpaceX\'s Starship - the fully reusable spacecraft designed for Mars colonization and beyond.',
        topic: 'Space Exploration',
        tags: 'SpaceX, Starship, Mars, Rockets, Space',
        creatorId: users[2].id,
        viewCount: 412,
        thanksCount: 67,
        forkCount: 12,
        sources: {
          create: [
            {
              url: 'https://www.spacex.com/vehicles/starship/',
              title: 'Official SpaceX Starship Page',
              type: 'article',
              notes: 'Official specifications and updates from SpaceX.',
              relevanceRating: 4
            },
            {
              url: 'https://www.youtube.com/watch?v=sYlQQBV6quI',
              title: 'Starship SN8 Flight Test',
              type: 'video',
              notes: 'Historic first high-altitude flight test. Watch to understand the development approach.',
              relevanceRating: 5
            },
            {
              url: 'https://everydayastronaut.com/starship-guide/',
              title: 'Everyday Astronaut\'s Starship Guide',
              type: 'article',
              notes: 'Excellent breakdown of all Starship variants and their purposes.',
              relevanceRating: 5
            },
            {
              url: 'https://www.nasaspaceflight.com/tag/starship/',
              title: 'NASA Spaceflight Starship Coverage',
              type: 'article',
              notes: 'Detailed technical analysis and development updates.',
              relevanceRating: 4
            }
          ]
        },
        takeaways: {
          create: [
            { content: 'Starship is designed for full reusability - both Super Heavy booster and ship return to launch site.', order: 0 },
            { content: 'Iterative development approach: build fast, test often, learn from failures.', order: 1 },
            { content: 'Capacity: 100+ tons to LEO, designed for 100 passengers for Mars missions.', order: 2 },
            { content: 'Key innovation: orbital refueling enables deep space missions without larger rockets.', order: 3 }
          ]
        }
      }
    }),
    prisma.researchPack.create({
      data: {
        title: 'Getting Started with Quantum Computing',
        description: 'A beginner-friendly introduction to quantum computing concepts, algorithms, and programming. No physics background required.',
        topic: 'Quantum Computing',
        tags: 'Quantum, Computing, Qiskit, Algorithms, Physics',
        creatorId: users[0].id,
        viewCount: 156,
        thanksCount: 28,
        forkCount: 6,
        sources: {
          create: [
            {
              url: 'https://qiskit.org/textbook/preface.html',
              title: 'Qiskit Textbook',
              type: 'book',
              notes: 'Free, interactive textbook. Best starting point for beginners.',
              relevanceRating: 5
            },
            {
              url: 'https://www.youtube.com/watch?v=JxwyWwE6W0I',
              title: 'Quantum Computing for the Determined',
              type: 'video',
              notes: 'Excellent video series explaining quantum concepts intuitively.',
              relevanceRating: 4
            },
            {
              url: 'https://arxiv.org/abs/quant-ph/9809016',
              title: 'Quantum Computation and Quantum Information (Nielsen & Chuang)',
              type: 'paper',
              notes: 'The definitive textbook. Advanced but comprehensive.',
              relevanceRating: 4
            }
          ]
        },
        takeaways: {
          create: [
            { content: 'Qubits can exist in superposition - being 0 and 1 simultaneously until measured.', order: 0 },
            { content: 'Entanglement allows qubits to be correlated in ways impossible classically.', order: 1 },
            { content: 'Quantum algorithms like Shor\'s and Grover\'s show potential speedups for specific problems.', order: 2 },
            { content: 'Current NISQ devices are noisy and limited - fault-tolerant quantum computers are still years away.', order: 3 }
          ]
        }
      }
    }),
    prisma.researchPack.create({
      data: {
        title: 'Machine Learning for Trading',
        description: 'Practical guide to applying machine learning techniques to financial markets. Covers data sources, feature engineering, and model development.',
        topic: 'Finance & ML',
        tags: 'Finance, Machine Learning, Trading, Stocks, Quant',
        creatorId: users[1].id,
        viewCount: 298,
        thanksCount: 45,
        forkCount: 9,
        sources: {
          create: [
            {
              url: 'https://www.quantopian.com/lectures',
              title: 'Quantopian Lectures',
              type: 'article',
              notes: 'Excellent free lectures on quantitative finance. Platform is closed but content remains valuable.',
              relevanceRating: 5
            },
            {
              url: 'https://www.youtube.com/watch?v=9Y3yaoi9rUQ',
              title: 'Machine Learning for Trading by Georgia Tech',
              type: 'video',
              notes: 'Full university course available for free. Great structure.',
              relevanceRating: 5
            },
            {
              url: 'https://www.amazon.com/Advances-Financial-Machine-Learning-Marcos/dp/1119482089',
              title: 'Advances in Financial Machine Learning',
              type: 'book',
              notes: 'Advanced but essential reading. Focus on practical challenges in financial ML.',
              relevanceRating: 4
            }
          ]
        },
        takeaways: {
          create: [
            { content: 'Overfitting is the biggest risk - always test on out-of-sample data.', order: 0 },
            { content: 'Feature engineering matters more than model complexity in financial applications.', order: 1 },
            { content: 'Transaction costs and slippage can destroy returns - always include in backtests.', order: 2 },
            { content: 'Market regime changes can invalidate models - monitor for concept drift.', order: 3 }
          ]
        }
      }
    })
  ])

  console.log('Created packs:', packs.map(p => p.title).join(', '))
  console.log('\nSeed complete! Created', users.length, 'users and', packs.length, 'research packs.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
