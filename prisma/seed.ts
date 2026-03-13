import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const texts = [
  {
    title: "A Day in the Life",
    level: "A1",
    category: "Daily Life",
    content: `My name is Tom. I wake up at seven o'clock every morning. First, I brush my teeth and wash my face. Then I eat breakfast. I usually have bread with butter and a cup of tea.

After breakfast, I go to work. I take the bus because I do not have a car. The bus ride takes twenty minutes. At work, I sit at a desk and use a computer.

For lunch, I eat a sandwich and drink water. I talk with my friends at the table. We laugh and tell stories.

In the evening, I go home and cook dinner. I like soup and rice. After dinner, I watch television for one hour. Then I read a book and go to sleep at ten o'clock.

I am happy with my simple life.`,
    questions: [
      { question: "What time does Tom wake up?", type: "multiple_choice", options: ["Six o'clock", "Seven o'clock", "Eight o'clock", "Nine o'clock"], correctAnswer: "Seven o'clock", explanation: "The text says 'I wake up at seven o'clock every morning.'", order: 1 },
      { question: "How does Tom go to work?", type: "multiple_choice", options: ["By car", "By train", "By bus", "On foot"], correctAnswer: "By bus", explanation: "Tom says 'I take the bus because I do not have a car.'", order: 2 },
      { question: "What does Tom eat for breakfast?", type: "multiple_choice", options: ["Eggs and milk", "Bread with butter and tea", "Rice and soup", "Sandwich and water"], correctAnswer: "Bread with butter and tea", explanation: "The text says 'I usually have bread with butter and a cup of tea.'", order: 3 },
    ],
  },
  {
    title: "My Family",
    level: "A1",
    category: "Daily Life",
    content: `I have a small family. There are four people in my family: my mother, my father, my sister, and me.

My mother's name is Maria. She is forty years old. She works in a school. She is a teacher. She loves books and gardens.

My father's name is John. He is forty-two years old. He works in a hospital. He is a doctor. He likes sports and cooking.

My sister's name is Lisa. She is sixteen years old. She goes to school. She likes music and dancing. She plays the guitar.

I am twenty years old. I study at university. I like computers and movies.

We live in a small house. We eat dinner together every day. We are a happy family.`,
    questions: [
      { question: "How many people are in the family?", type: "multiple_choice", options: ["Two", "Three", "Four", "Five"], correctAnswer: "Four", explanation: "The text says 'There are four people in my family.'", order: 1 },
      { question: "What does the mother do?", type: "multiple_choice", options: ["She is a doctor", "She is a teacher", "She is a cook", "She is a student"], correctAnswer: "She is a teacher", explanation: "The text says 'She works in a school. She is a teacher.'", order: 2 },
      { question: "What instrument does Lisa play?", type: "multiple_choice", options: ["Piano", "Drums", "Violin", "Guitar"], correctAnswer: "Guitar", explanation: "The text says 'She plays the guitar.'", order: 3 },
    ],
  },
  {
    title: "At the Supermarket",
    level: "A2",
    category: "Daily Life",
    content: `Every Saturday morning, Sarah goes to the supermarket to buy food for the week. She always makes a shopping list before she leaves home, so she doesn't forget anything.

When she arrives at the supermarket, she gets a shopping cart and starts walking through the aisles. First, she goes to the fruit and vegetable section. She picks up apples, bananas, tomatoes, and lettuce. She always chooses fresh vegetables carefully.

Next, she moves to the dairy section, where she buys milk, cheese, and yoghurt. She prefers low-fat products because she is watching her diet.

After that, Sarah goes to the bakery section and picks up a loaf of whole-grain bread. The smell of fresh bread always makes her feel hungry!

At the end, she goes to the checkout. The cashier scans all her items and tells her the total price. Sarah pays with her credit card. She thanks the cashier with a smile and walks to her car.

She enjoys grocery shopping because it helps her plan healthy meals for the week.`,
    questions: [
      { question: "When does Sarah go to the supermarket?", type: "multiple_choice", options: ["Every Sunday", "Every Saturday morning", "Every Friday evening", "Every day"], correctAnswer: "Every Saturday morning", explanation: "The text says 'Every Saturday morning, Sarah goes to the supermarket.'", order: 1 },
      { question: "Why does Sarah make a shopping list?", type: "multiple_choice", options: ["To save money", "So she doesn't forget anything", "For her diet", "To be faster"], correctAnswer: "So she doesn't forget anything", explanation: "She makes a list 'so she doesn't forget anything.'", order: 2 },
      { question: "How does Sarah pay?", type: "multiple_choice", options: ["With cash", "With a check", "With a credit card", "With her phone"], correctAnswer: "With a credit card", explanation: "The text says 'Sarah pays with her credit card.'", order: 3 },
      { question: "Why does Sarah prefer low-fat products?", type: "multiple_choice", options: ["They are cheaper", "She is watching her diet", "She doesn't like fat", "They taste better"], correctAnswer: "She is watching her diet", explanation: "The text says 'She prefers low-fat products because she is watching her diet.'", order: 4 },
    ],
  },
  {
    title: "Exploring Paris",
    level: "A2",
    category: "Travel",
    content: `Paris is the capital city of France and one of the most visited cities in the world. Millions of tourists come here every year to explore its beautiful streets, famous museums, and incredible food.

The most famous landmark in Paris is the Eiffel Tower. It was built in 1889 and stands 330 meters tall. At night, the tower lights up and creates a magical view over the city. Many visitors go to the top to see Paris from above.

Another popular destination is the Louvre Museum, which is the largest art museum in the world. It contains thousands of works of art, including the famous painting called the Mona Lisa, created by Leonardo da Vinci.

Paris is also famous for its cuisine. The city has hundreds of bakeries called boulangeries, where you can buy fresh croissants and bread. French cuisine is considered some of the best in the world.

Walking along the River Seine is a wonderful experience. There are many bridges decorated with padlocks, which represent love and friendship. Couples from around the world come to attach a lock to the bridge.

Paris truly deserves its nickname: "The City of Light."`,
    questions: [
      { question: "When was the Eiffel Tower built?", type: "multiple_choice", options: ["1799", "1850", "1889", "1900"], correctAnswer: "1889", explanation: "The text says 'It was built in 1889.'", order: 1 },
      { question: "What is the Louvre?", type: "multiple_choice", options: ["A restaurant", "The largest art museum in the world", "A famous bridge", "The tallest building in Paris"], correctAnswer: "The largest art museum in the world", explanation: "The text describes the Louvre as 'the largest art museum in the world.'", order: 2 },
      { question: "What is Paris's nickname?", type: "multiple_choice", options: ["The City of Love", "The City of Light", "The Fashion Capital", "The Beautiful City"], correctAnswer: "The City of Light", explanation: "The last line says Paris is called 'The City of Light.'", order: 3 },
    ],
  },
  {
    title: "The Rise of Artificial Intelligence",
    level: "B1",
    category: "Technology",
    content: `Artificial Intelligence, commonly known as AI, is one of the most transformative technologies of the 21st century. It refers to the ability of computer systems to perform tasks that typically require human intelligence, such as understanding language, recognizing images, and making decisions.

AI has been developing rapidly over the past decade, largely due to advances in machine learning — a technique that allows computers to learn from large amounts of data. Instead of being explicitly programmed with rules, a machine learning system improves its performance by analyzing patterns in data.

Today, AI is present in many aspects of our daily lives. Virtual assistants like Siri and Alexa use natural language processing to understand our voice commands. Recommendation algorithms on platforms like Netflix and Spotify analyze our preferences to suggest content we might enjoy. In medicine, AI is being used to diagnose diseases with greater accuracy than human doctors in some cases.

However, AI also raises important ethical concerns. One major worry is job displacement — as machines become capable of performing more tasks, many traditional jobs may disappear. There are also concerns about privacy, since AI systems require vast amounts of personal data to function effectively.

Despite these challenges, most experts agree that AI has the potential to solve some of humanity's greatest challenges, including climate change, disease, and poverty. The key, they argue, lies in developing AI responsibly and ensuring that its benefits are shared widely.`,
    questions: [
      { question: "What is machine learning?", type: "multiple_choice", options: ["A programming language", "A technique that allows computers to learn from data", "A type of robot", "A way to connect to the internet"], correctAnswer: "A technique that allows computers to learn from data", explanation: "The text describes machine learning as 'a technique that allows computers to learn from large amounts of data.'", order: 1 },
      { question: "What is one negative concern about AI?", type: "multiple_choice", options: ["It is too expensive", "Job displacement", "It uses too much electricity", "It is difficult to program"], correctAnswer: "Job displacement", explanation: "The text mentions 'job displacement — as machines become capable of performing more tasks, many traditional jobs may disappear.'", order: 2 },
      { question: "According to the text, where is AI being used in medicine?", type: "multiple_choice", options: ["To replace all doctors", "To reduce costs", "To diagnose diseases with greater accuracy", "To perform surgery automatically"], correctAnswer: "To diagnose diseases with greater accuracy", explanation: "The text says 'AI is being used to diagnose diseases with greater accuracy than human doctors in some cases.'", order: 3 },
      { question: "What do experts say is key to benefiting from AI?", type: "multiple_choice", options: ["Building faster computers", "Developing AI responsibly and sharing its benefits", "Limiting AI to rich countries", "Keeping AI secret from the public"], correctAnswer: "Developing AI responsibly and sharing its benefits", explanation: "The text states 'The key lies in developing AI responsibly and ensuring that its benefits are shared widely.'", order: 4 },
    ],
  },
  {
    title: "Climate Change and Our Future",
    level: "B1",
    category: "Science",
    content: `Climate change is one of the most pressing issues of our time. The Earth's average temperature has been rising steadily over the past century, mainly due to the increase in greenhouse gases — particularly carbon dioxide (CO2) — in the atmosphere. These gases trap heat from the sun and prevent it from escaping into space, creating a warming effect known as the greenhouse effect.

The primary cause of rising CO2 levels is the burning of fossil fuels such as coal, oil, and natural gas for energy. Deforestation also contributes significantly, as trees absorb CO2 and their removal reduces the planet's capacity to regulate carbon levels.

The consequences of climate change are wide-ranging and serious. Rising sea levels threaten coastal cities and low-lying islands. Extreme weather events, including hurricanes, droughts, and floods, are becoming more frequent and severe. Many plant and animal species are facing extinction as their natural habitats change too quickly for them to adapt.

Addressing climate change requires action at multiple levels. Governments must implement policies that reduce emissions, such as carbon taxes and renewable energy subsidies. Businesses need to transition to sustainable practices. Individuals can also make a difference by reducing meat consumption, using public transport, and supporting green energy.

The scientific community is united in its conclusion: urgent and coordinated global action is needed to limit warming to 1.5°C above pre-industrial levels, as defined by the Paris Agreement. Time is running out.`,
    questions: [
      { question: "What is the main cause of rising CO2 levels?", type: "multiple_choice", options: ["Volcanic eruptions", "Burning fossil fuels", "Ocean evaporation", "Animal farming"], correctAnswer: "Burning fossil fuels", explanation: "The text states 'The primary cause of rising CO2 levels is the burning of fossil fuels.'", order: 1 },
      { question: "What does the greenhouse effect do?", type: "multiple_choice", options: ["It cools the planet", "It traps heat and warms the planet", "It helps plants grow", "It reduces rainfall"], correctAnswer: "It traps heat and warms the planet", explanation: "The text explains that greenhouse gases 'trap heat from the sun and prevent it from escaping into space, creating a warming effect.'", order: 2 },
      { question: "What temperature limit did the Paris Agreement set?", type: "multiple_choice", options: ["1°C", "1.5°C", "2°C", "2.5°C"], correctAnswer: "1.5°C", explanation: "The text mentions 'limit warming to 1.5°C above pre-industrial levels, as defined by the Paris Agreement.'", order: 3 },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  for (const t of texts) {
    const wordCount = t.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    const text = await prisma.text.create({
      data: {
        title: t.title,
        level: t.level,
        category: t.category,
        content: t.content,
        wordCount,
        readingTime,
      },
    });

    for (const q of t.questions) {
      await prisma.question.create({
        data: {
          textId: text.id,
          question: q.question,
          type: q.type,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          order: q.order,
        },
      });
    }

    console.log(`  ✓ Created: "${t.title}" (${t.level})`);
  }

  console.log(`\n✅ Seeded ${texts.length} texts successfully!`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
