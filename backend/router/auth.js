const express = require('express');
const OpenAI = require('openai');
const axios = require('axios');
const User = require('../userSchema'); // Assuming your user schema is in this folder
const Retell = require('retell-sdk');

const router = express.Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
});
const retellClient = new Retell({
  apiKey: process.env.RETELLAI_KEY
});



router.post('/check-email', async (req, res) => {
  const { email } = req.body;

  try {
    // Check if a user with the given email already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // If the user exists, return their projects and questions
      return res.status(200).json({ user });
    } else {
      // If the user does not exist, create a new user
      user = new User({ email, projects: [] }); // projects will be added later
      await user.save();
      return res.status(201).json({ user });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});



router.post('/generate-questions', async (req, res) => {
  console.log(req.body)
  const { projectName, projectOffering, feedbackDesired } = req.body;

  // Validate the incoming request data
  if (!projectName || !projectOffering || !feedbackDesired) {
    return res.status(400).json({
      error: 'Please provide project_name, project_offering, and desired_feedback.',
    });
  }

  try {
    // Create a completion request to OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4', // Using GPT-4 model for best quality
      messages: [
        {
          role: 'system',
           content: `You're a UX researcher. You're tasked to come up with 6 to 8 questions based for "${projectName}" based on "${projectOffering}" and aligning with "${feedbackDesired}".

Keep in mind the friendly welcome has to be generic and relatable, so don't assume something here. Also keep the questions engaging, friendly.

The friendly welcome should be broadly along these lines:

Hello! I'm EVA, an AI designed for collecting user insights. I'd like to speak to you about {what's the interview is about or product name} experience. Ready to share some thoughts.



Feel free to change it as you see context. Don't repeat the friendly welcome message. Don't mention anything about you're recording or note taking.



Here're the broad principles of creating to user interview questions to keep in mind. We want the questions to be rather not to long or verbose.

PART 1: How to structure a user interview?

How to structure user interviews to derive impactful insights

Let’s first begin with the macro - the structure.

I'm a big fan of the ‘5 Act Interview’ from GV and Design Sprints.

GV have a great video on the ‘5 act interview’ (below) for those who haven’t seen a user interview or user testing session in practice it’s a great example of what a good one can look like!

In the book, they describe 5 acts (or stages) of an interview.

- Friendly Welcome
- Context questions
- Introduce the Prototype
- Tasks
- Debrief 

However whilst the 5 Act Interview was originally designed for user testing, the structure is sound even for user interviews.

I do the following modification for interviews which don’t include a testing a prototype or similar:

- Friendly welcome
- Context questions
- Core interview questions
- Quick debrief

Modified 5 Act Interview by GV to suit interviews without a tasks or a prototype

I will walk through each stage in detail. I wanted to start here as you’ll see when we get into question design later, structure and how we design our questions aren’t mutually exclusive if we wish to maximise impact.

1) Friendly Welcome

The first stage is the friendly welcome. 

As the name suggests, this is where you welcome the participant, but it’s actually much more than that.

The goal of this first act is really to relax the participant and put their mind at ease.

Interviewing can be a stressful experience, especially for those who haven’t participated in a user interview before. This can be a barrier to effective feedback. Therefore, before asking any questions, we want to ensure the participant is as relaxed and comfortable as possible.

I also like to use this moment to ask for their permission one last time before we start to reassure them that they're in control and also to make sure they're ready to start.

An example of how this can look is:

“Hi, my name is Ant. I’m a Product Manager here and beside me is [name]. We’d first like to thank you for making the time to come in today.

This interview should take no more than 45 minutes and we will stick to time. We have a few questions we’d like to ask you about your experiences with [Y]. This is not a test, we’re not trying to test you, we’re actually trying to learn as much as possible about this space, so please be honest. Your honesty will help us greatly.

Finally, before we start, with your permission, we would like to record this conversation as it will help us later with note taking. The recording will be strictly confidential and for internal use only - how does all that sound?”

Friendly Welcome Checklist:

- Introduce yourself.
- Thank the participant for making themselves available.
- Ask the participant if you have their permission to record the interview, as it will help us take notes. It is strictly confidential and will only be used internally.
- Inform the participant that this should take no more than 30 minutes, and we will stick to that time.
- Explain that you have several questions to start with, and then you have a solution concept you would like to walk through.
- Explain that you will be taking notes throughout.
- Tell them to be honest in their answers - we’re not testing them!

2) Context Questions

Once we’ve completed the welcome and introduction, as Jake Knapp brilliantly puts in the 5 Act Interview video, “you will be itching to show them your prototype, but not so fast!”.

This also goes for user interviews that don’t include a prototype - no doubt you will have several key questions that you’re dying to ask the participant but wait a moment.

I like to think of a great user interview like a workout. We need to first start with doing a proper warm-up to avoid injury and get the most out of the session.

The same goes for user interviews. Before we bring out the prototype or ask our core questions, we first need to warm the participant up - this is where ‘Context Questions’ come in.

We want to take a moment to ease your participants into the interview.

Rather than jumping straight into those deep questions, we want to start with some more lightweight questions - remember, for a lot of participants, this will be the first user interview.

However, by no means is this wasted ‘small talk’. You only have a limited amount of time, so make the most of it.

Therefore, we want to take advantage of this moment to ask contextual questions and explore the periphery of the problem space we’re interviewing them about.

For example, if you were doing research into people’s exercise habits, you may begin by asking what they do for work if their job is active or not, or perhaps you might even ask them questions about their diet habits, etc.

If done well enough, the questions you ask here can help improve the quality of the responses when you ask your main questions.

For example, it might be hard for someone to immediately recall all the details of when they last had a gym membership and the exercise routines they did, etc, but by asking the right contextual questions, you can help jolt the participant's memory on such details - more on this later when we discuss question design.

Contextual Question Checklist:

- Don’t ‘small talk’.
- Use this moment to gain a greater understanding of their context.
- (covered below in question design) Ask questions that will give a greater chance of generating cues to access ‘cued recall’ memories and/or ask questions that work in chronological or serial order to lead into your core questions, allowing for greater access to ‘serial recall’ memories.

3) Core Interview Questions / Prototype

After we’ve eased the participant into the interview and asked them contextual questions they should now be ready to be either presented with your prototype or asked the core questions you have been dying to ask.

This act is the core part of the user interview and where the majority of time is spent.

You don’t always need to present a prototype at this stage, as mentioned, you may simply ask questions to learn more about your users. Alternatively, you may want to do an activity like card sorting here.

Prototype/Activity Checklist:

- Remain neutral whilst introducing the prototype or activity (e.g. Card Sorting). Be careful of the ‘Framing Effect’ which is where how we frame something impacts how the person perceives it. For example, avoid saying things like “This is our prototype, which we’re really proud of…”
- Be mindful not to interject bias while giving the participant tasks.
- Avoid explaining the prototype to the participant or telling them what to do.
- Remind the participant to ‘think aloud’ whilst they complete the tasks.

Core Questions Checklist:

- Core questions should be based on the assumptions that you want to test.
- Avoid asking direct questions like “Do you find it difficult to find a taxi?” and aim to remain unbiased and instead ask questions that seek out evidence (e.g. “How often do you ride taxis?”, “Can you walk me through your last experience with riding a taxi"?”) - more on this below in ‘Question Design’.
- Try your best to remain on script. Asking your users different questions between interviews will give you disparate data, making it hard to synthesise. Aime to be able to compare ‘apples-to-apples’.

4) Quick debrief

Once they have completed the prototype and/or your core interview questions, it’s time for a quick debrief.

Similar to the introduction, this should take no more than a few minutes.

In the debrief, you want to recount some of the observations you made during the interview. This is an excellent opportunity to clarify that you haven’t misinterpreted any key information.

Further, the debrief is also a great opportunity to ask final open-ended questions such as “Is there anything else you’d like to share that we didn’t cover today?”.

These open-ended questions are ideal to help uncover unknown-unknowns. Whilst you want to test your assumptions during the interview and remain on script, we must also acknowledge that in doing so, we are only exploring known-unknowns, there are still unknown-unknowns.

Asking such open-ended questions can help you catch some of those unknown-unknowns.

Finally, to conclude the interview, thank the participant again for their time, and if you have an interview incentive, like a gift card, give that to them and escort them out.

Quick Debrief Checklist:

- Playback key observations you made during the interview.
- Clarify that you heard the participant correctly and that key observations weren’t misinterpreted.
- Ask a final open-ended question to unearth any unknown-unknowns.
- (if you are offering an incentive) remember to give that incentive (e.g. gift card) to the participant.
- Remember to thank the participant.
- Oh, and did I mention, remember to thank them!

Here’s an example interview script that I used in the past to give you an idea of how it all looks together:

Example complete interview script

PART 2: Question Design

Whilst interview structure can have a meaningful impact, the true art of user interviews is in the questions.

In this section, I want to cover several considerations and strategies when it comes to designing impactful questions - those being:

- Asking Powerful Questions
- Leveraging Memory Recall and
- The Ladder of Inference

However, before we get into question design, I want to clarify that none of this matters if you’re not asking the right questions in the first place.

Think of it like having a spotlight. It doesn’t matter how bright or clear the light is if you’re looking in the wrong room. You need to first make sure you’re in the right room, and then we can strengthen the light.

As a result, question design starts with defining - what do you want to learn?

Or another way to frame it is: what are your ‘riskiest assumptions’?

if you want to learn more about kicking Product Discovery off, watch my walkthrough of my Product Discovery workshop board or read this previous post - and grab the Miro board here.

For each assumption, I will typically come up with 2-3 questions. This is the foundation.

The assumption - or simply ‘what you want to learn more about?’ - is making sure you’re in the “right room” so to speak.

Therefore, I often end up with a structure that looks like the screenshot below:

You can access my User Interview template for free on Product Pathways

Asking Powerful Questions

It shouldn’t be a surprise that when we interview users we want to avoid things like leading questions, closed questions or questions that elicit a simple ‘yes or no’ response.

There’s a coaching tool known as ‘Powerful Questions’ (FYI, the Co-active training institute have a great PDF guide to powerful questions here).

Powerful questions are questions that are more open-ended and invoke reflection.

The above visualisation is a common way for people to draw a kind of hierarchy when it comes to thinking about powerful questions. I think of this as a ‘first principle’ of powerful questions.

At the top you have WHY/WHAT/HOW questions. typically, any question starting with one of these adverbs will be a more powerful question than a question starting with WHEN/WHO/or WHICH.

Having this framing in the back of your head as you craft your interview questions can help you frame them in a way that they’re more ‘powerful’.

For example, asking a participant, “Can you walk me through what you did the last time you couldn’t access online banking?” will yield much richer information than asking, “Do you want to be able to access online banking 24/7?”

Of course, there are moments where more closed questions (less powerful ones) are necessary. As mentioned, any question must first be based on your assumptions and ‘what you need to learn?’.

Leveraging Memory Recall

Another reason why we want to ease participants into interviews through the above structure is because of how our minds recall memories and information.

There are 3 different types of memory recall: free recall, cued recall, and serial recall.

As the name suggests, free recall is when we freely recall the memory. For example, when asked the question, you recall it freely without any additional assistance.

Next is ‘cued recall’, where we recall memories based on a cue or trigger.

Have you ever smelled something and it reminded you of a memory? That’s cued recall! The stronger the association between the cue and the memory, the easier it will be to recall it. The amazing part of cued recall is that we’re able to tap into memories that aren’t available via free recall.

Finally, we have serial recall, where we recall information in sequence or chronological order.

During the beginning of the interview (Friendly Welcome and contextual Questions), we are mainly tapping into free recall.

This becomes a limitation when we ask our core questions, as we can only access limited information.

Free recall information is also riddled with biases such as availability bias, recency bias, and anchoring.

Therefore, we want to design our contextual questions in such a way that they help us access a wider pool of memories for our core questions (cued and serial recall).

Leverage contextual questions to set up for your core questions

To achieve this we want to consider the following when designing our contextual questions:

- we want to ask questions that explore a similar context to our core questions to help promote the chances of generating cues and;
- we want to ask questions that work in a chronological or serial order - in other words asking people to remember the first gym they registered for can help set them up for deeper questions that might be more recent, working in a chronological order.

The Ladder of Evidence & Inference

We’ve all heard the adage often attributed to Henry Ford; “if I asked people what they wanted, they would have said faster horses.”

But effective user interviews are much more than asking your users what they want - it’s about building a better understanding of their context to uncover problems, needs, behaviours, and motivations.

Let’s for a second entertain the Henry Ford quote - what might a faster horse be solving?

- I want to spend more time with my family (rather than commuting).
- I cannot sell my goods to the next town as they spoil before I get there.
- I would like the ride to be brief because riding a horse is uncomfortable.
- …etc…

You can see that whilst the solution is a ‘faster horse’ the range of problems your users face are vast.

This is your job as the interviewer. We are here to uncover the deeper needs and problems, otherwise, Ford was right!

Teresa Torres has a brilliant framework to help facilitate this. It’s called ‘The Ladder of Evidence’.

I won’t cover the Ladder of Evidence in detail as you can read Teresa’s article on it here or you can watch the video above but the way I’d describe the ladder of evidence is that asking someone if they like something doesn’t necessarily mean that they will purchase it. Equally saying that you would buy something and actually doing it, are two different things. Anyone who has set a new year resolution has first-hand experience with this.

Therefore, as a general rule of thumb, rather than asking participants their opinion on things, we want to ask questions that are grounded in evidence.

Asking, “Have you done this before?” or getting them to walk you through what they’ve done in the past is much richer data than “I think I would do X” - that’s an assumption and, arguably, speculation. We don’t actually know if that would be the case. But if you’ve done it in the past, then my confidence that you might do it again is higher - right?

“Our past behavior is a better indicator of our future behavior than our speculation about our future behavior. In other words, I’m more likely to go the gym next week if I went to the gym last week than if I’ve never been to the gym but think I’ll go next week.” - Teresa Torres

The Ladder of Inference (unsure of any relation here) is another great mental model for framing better questions as well.

Developed by Harvard Business School Professor Chris Argyris. Argyris defines cognition as the following ladder:





- First we have the data and information available to us.
- We then select data based on our observation.
- We add meaning to the selected data.
- We then make assumptions based on the meaning that we assign to the selected data.
- Those assumptions lead us to draw conclusions.
- And our conclusions shape our beliefs.
- Finally those beliefs influence our actions.
- Ladder of Inference by Chris Argyris (Pic credit: Wikipedia)

The Ladder of Inference is a great example of why testing assumptions and Product Discovery are so important. It illustrates why we must challenge our own conclusions and test our assumptions.

But it’s also a great reference for user interviews as well.

Just like Teresa Torres’s Ladder of Evidence, you can leverage the Ladder of Inference to avoid asking questions that are lower in the ladder.

For example, asking someone what they think will be lower on the ladder than asking what they believe to be true. And no surprise that at the top of the ladder is action - what the user actually did!

This is why observation is such a powerful research technique. You can mix observation with interviewing. This is known as contextual inquiry.

“Contextual inquiry is a type of ethnographic field study that involves in-depth observation and interviews of a small sample of users to gain a robust understanding of work practices and behaviors.” — Nielson Norman Group

Observing users in their context is excellent for uncovering contextual nuances that might have been missed.

But there will be times where going to your users or observing them might not be possible, in these situations, as Teresa Torres also points out in her Ladder of Evidence, we can fall back to asking questions based on past experiences.

Past behaviours represent what your users actually did - or at least what they recalled they did. This is always going to be more reliable data than asking your users what they think they would do.

Again, try to find facts, not opinions, based on assumptions.

What do you think? = Not great

Do you like this feature? = Not great either

Would you pay $10 a month for this? = Bad

Have you used something similar in the past? = Better

When was the last time you faced this problem? = Good

Can you walk me through the last time you had this issue? What did you do? = Great

Conclusion

There is more to this topic, but these two core concepts are what I’ve been dying to write about for a while now. Through my work with clients, coaching, and training courses I’ve realised that there aren’t too many guides out there that layout either the interview structure or some of the key mental models to help you design better interview questions.

I hope proves to be a go-to resource for many. I really took the time to make this as comprehensive and actionable as possible. As reference, it’s taken me 3 weeks on-and-off to write, rewrite, and edit.

The final thought I’ll leave you with is to remember that whilst the interview isn’t where the magic happens - that’s really after when synthesizing the data to draw insights - there is still a ‘garbage-in, garbage-out’ equation. High-quality data from effective user interviews will lead to better insights later on.

Therefore, learning how to conduct user interviews that draw high-quality insights is a core skill that any product-builder (whether you’re founders, Product Manager, designer, or anyone else) should hone.



Also few more examples of good user interview questions:

Question Tags Scenarios Types

What aspects of your experience stood out the most? Product Recall Multiple Choice Block, Open Question Block

What are you currently doing to make this [PROBLEM] / [TASK] easier? Problem, Solution, Task Opportunity Open Question Block

Do you have any additional thoughts you would like to share about the new feature? Product Sentiment, Wrap-up Open Question Block, Yes/No Block

How does this [PROBLEM] impact other areas of your work? Pain, Problem, Task Opportunity Open Question Block

What other solutions have you tried when looking to accomplish [TASK]? Product, Solution, Task Motivation, Opportunity Multiple Choice Block, Open Question Block

What is the most challenging aspect of [PROBLEM]? Problem, Task Opportunity Open Question Block

What type of workarounds have you created to help you with this [TASK]? Problem, Solution, Task Opportunity Open Question Block

What do you like about how you currently solve [PROBLEM]? Problem, Solution Opportunity, Sentiment Open Question Block

What aspects of the design stood out to you? Design Desirable Open Question Block

To what extend do you feel this design was made for you? Design, Solution Sentiment Multiple Choice Block, Open Question Block, Opinion Scale Block

How, if at all, do you expect [PRODUCT] to help you accomplish your business goals? Goal, Product Expectation Open Question Block

Is there anything else about [PRODUCT] that you would like to share? Product Sentiment, Wrap-up Open Question Block, Yes/No Block

What are your primary business goals? Goal Motivation, Useful Open Question Block

Will you continue to use [FEATURE]? Product Desirable, Sentiment Open Question Block, Yes/No Block

What's the single most important thing we could do to make [PRODUCT] better? Product Opportunity Open Question Block

At what price point is [PRODUCT] too expensive? Product Pricing Open Question Block

Before we start, what you do professionally? People Demographics, Findable Open Question Block, Screener Block

How did you feel about the task you performed? Task Usable Open Question Block

Overall, how easy or difficult was it to perform this task? Task Usable Opinion Scale Block

Did the [FEATURE] work as you had expected? Product Expectation, Sentiment Yes/No Block

Do you have any challenges with your current solution? Pain, Solution Opportunity Yes/No Block

If any, what challenges do you face with your current solution? Pain, Solution Opportunity Open Question Block

If any, what problems do you face when you do [TASK]? Pain, Task Opportunity Open Question Block

What workarounds have you created for addressing any challenges you may have with your current solution? Pain, Solution Opportunity Open Question Block

What parts of the [PRODUCT] did you like the most? Product Desirable Multiple Choice Block, Open Question Block

What could be improved? Design, Product, Solution Opportunity, Sentiment, Usable Card Sort Block, Multiple Choice Block, Open Question Block

What could we do to improve this [FEATURE]? Product Desirable, Sentiment, Usable Open Question Block

Any other feedback you'd like to add? Product Sentiment, Wrap-up Open Question Block

What parts of the [PRODUCT] did you like the least? Product Desirable, Usable Open Question Block

Do you have any additional feedback for the team? Product Sentiment, Wrap-up Open Question Block, Yes/No Block

What would you expect to see from the website? Product Expectation Open Question Block

How did you find the language used on the website? Copy, Product Clarity, Sentiment Open Question Block, Opinion Scale Block

What are your thoughts on the layout? Design, Product Sentiment, Usable Multiple Choice Block, Open Question Block, Opinion Scale Block

Any additional feedback on your experience with the website? Product Sentiment, Wrap-up Open Question Block

How much would you pay for [PRODUCT]? Product Pricing Open Question Block

What would you expect to happen once you've [TASK]? Design, Task Expectation, Usable Multiple Choice Block, Open Question Block

What is the main thing you recall? Design Recall 5-Second Test Block

Based on what you saw, what do you think this product offers? Product Recall, Valuable 5-Second Test Block

Do you have any final thoughts on what you saw today? Product Sentiment, Wrap-up Open Question Block, Yes/No Block

What are your thoughts on the visual appearance of this page? Design Sentiment Open Question Block

Was there any other option you considered selecting instead? Design, Task Usable Mission Block, Open Question Block, Yes/No Block

What has led you to not start using [FEATURE]? Product Desirable, Usable Multiple Choice Block, Open Question Block

If any, please share any challenges you've faced while trying to use [FEATURE]. Problem, Product, Solution Desirable, Usable Open Question Block

What would prevent you from achieving [GOAL]? Goal, Problem Opportunity Open Question Block

Please complete this sentence: "The biggest challenge my team has with [PRODUCT] / [SOLUTION] is..." Pain, Problem Desirable, Sentiment, Usable Open Question Block

How many people work at your current organization? People Demographics Multiple Choice Block, Screener Block

What is the name of your department at your current company? People Demographics Open Question Block

How involved are you in the decision-making process when it comes to purchasing a new tool for work? People Demographics Multiple Choice Block, Opinion Scale Block, Screener Block

Which of the following best describes your current employment? People Demographics Multiple Choice Block, Screener Block

What made you buy [PRODUCT]? Adoption, Product, Solution Desirable, Expectation, Sentiment, Valuable Open Question Block

Walk me through the first time you did [TASK] Task Recall Open Question Block

Describe your first impression of our website in three words Product Sentiment Open Question Block

How confident did you feel while using [FEATURE]? Adoption, Product Recall, Sentiment, Usable Opinion Scale Block

What was your first impression of Concept A? Design Recall, Sentiment Opinion Scale Block

How believable is the claim? Content, Copy Sentiment Multiple Choice Block, Opinion Scale Block

What is the primary reason why you are canceling your account? Adoption, Problem, Product Motivation Multiple Choice Block, Open Question Block

What is your main goal when [TASK]? Goal, Task Useful Multiple Choice Block, Open Question Block

How did you first learn about [PRODUCT]? Product Findable Multiple Choice Block

Would you be interested in follow-up research with a member of the User Research team at [COMPANY]? Product Demographics, Wrap-up Open Question Block, Yes/No Block

Imagine that in this very moment, [PRODUCT] is no longer available to you and your team. Which of the following best reflects how you feel about this? Product Sentiment, Valuable Multiple Choice Block

Which of the following industries best describes your current company/organization? People Demographics Multiple Choice Block, Screener Block

Which of the following best describes your job function? People Demographics Multiple Choice Block, Screener Block

What does your role look like at your company? People Demographics Open Question Block, Screener Block

How integral is [PRODUCT] in your day to day work? Product Sentiment, Valuable Multiple Choice Block

How likely are you to recommend [PRODUCT] to a friend or colleague? People, Product Sentiment Opinion Scale Block

How might you go about performing [TASK]? Task Expectation, Usable Open Question Block

How did you feel overall when learning how to use [PRODUCT] in [SCENARIO]? Product Findable, Usable Opinion Scale Block

What feeling best describes your experience completing [TASK]? Task Usable Opinion Scale Block

Did the experience meet your expectations? Product Expectation, Valuable Opinion Scale Block, Yes/No Block

How effectively does this communicate [THEME]? Copy, Design Clarity Opinion Scale Block

How do you feel with [FEATURE]? Product Sentiment, Usable, Valuable Multiple Choice Block, Opinion Scale Block

How would you rate your overall experience with [PRODUCT]? Product Sentiment, Usable Multiple Choice Block, Opinion Scale Block

If you could change one thing about the design what would it be? Design Sentiment Open Question Block

Any challenges encountered while setting up [FEATURE]? Design, Product Findable, Usable Open Question Block, Yes/No Block

What is the main reason you use [PRODUCT]? Product Desirable, Sentiment, Valuable Multiple Choice Block

For how many, if any, of your work responsibilities do you rely on [PRODUCT]? Product, Solution Sentiment Multiple Choice Block

Which of the following best reflects your attitudes towards [PRODUCT]? Product Sentiment Multiple Choice Block

What tools are most important to help you accomplish your key responsibilities? Solution Sentiment Open Question Block

Please complete this sentence: "The most frustrating part of using [PRODUCT] is…” Pain, Product Sentiment Open Question Block

Please complete the following sentence: "With [PRODUCT], I hope that me/my team can..." Product, Solution Expectation Open Question Block

What teams do you work with on a daily basis? People Demographics Open Question Block

Which of the tools that you use at work has the largest impact on your work? Product Sentiment, Valuable Open Question Block

How do you prefer to be trained on new software? Adoption, Product Useful Multiple Choice Block

There are no other products like [PRODUCT] out there. Product Sentiment, Valuable Opinion Scale Block

Is anything missing from your experience? People Useful Open Question Block, Yes/No Block

Are there any elements on the website that you believe are missing? Product Findable, Usable Open Question Block

We may be interested in contacting you to learn more about your answers, are you open to us doing so? People Sentiment, Wrap-up Yes/No Block

Were there any aspects of the messaging that you found confusing? Copy, Design Clarity Yes/No Block

Have you ever used a website or app that lets you [SERVICE]? Product, Solution Findable, Recall, Valuable Yes/No Block

Have you started using [FEATURE]? Adoption Demographics Yes/No Block

Have you used [PRODUCT] before? Adoption Demographics Multiple Choice Block, Screener Block, Yes/No Block




`
        },
        {
          role: 'user',
          content: `The project name is "${projectName}". The project is offering "${projectOffering}". The desired feedback focuses on "${feedbackDesired}". Please generate a set of 2-3 interview questions following these fields, starting with general project-related questions and moving toward more specific feedback-driven questions.`,
        },
      ],
      max_tokens: 500,  // Set the token limit high enough to generate multiple questions
      temperature: 0.7,  // Slightly creative but controlled
    });

    // Return the generated questions as a JSON response
    res.status(200).json({
      questions: completion.choices[0].message.content.trim().split('\n'),
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    res.status(500).json({
      error: 'Failed to generate interview questions. Please try again later.',
    });
  }
});




router.post('/create-llm', async (req, res) => {
  const { questions } = req.body;
  console.log(questions[0].questionText)
  // Validate questions input
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ error: 'Please provide an array of questions.' });
  }

  try {
    // Create a new LLM in Retell with the provided questions
    const llmResponse = await retellClient.llm.create({
      general_prompt: "You are an assistant who will ask the following questions one by one. Wait for the user's response before asking the next question.",
      states: questions.map((question, index) => ({
        name: `question_${index + 1}`,
        state_prompt: question.questionText,
        edges: index < questions.length - 1 ? [
          {
            destination_state_name: `question_${index + 2}`,
            description: "Move to the next question after receiving the user's response."
          }
        ] : [],
      })),
      starting_state: 'question_1',
      begin_message: "I will start by asking you a series of questions. Please answer each question before we proceed to the next one."
    });

    //Link the newly created LLM to your Retell agent (assuming you have an agent setup)
    const createdAgent = await retellClient.agent.create({
      llm_websocket_url: llmResponse.llm_websocket_url,  // Use the passed WebSocket URL from LLM creation
      voice_id: '11labs-Adrian',  // Define voice ID
      agent_name: 'Ryan',  // Agent name
    });

    res.status(200).json({
      message: 'LLM created successfully',
      agent_id: createdAgent.agent_id,
      // agent_id: createdAgent.id
      // agent_response: agentResponse.data
    });
  } catch (error) {
    console.error('Error creating LLM:', error);
    res.status(500).json({ error: 'Failed to create LLM. Please try again later.' });
  }
});




 

// // Route to save interview questions to the user schema
// router.get('/user/:email/projects', async (req, res) => {
//   const { email } = req.params;

//   try {
//     const user = await User.findOne({ email }).populate('projects.questions');
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     return res.status(200).json({ projects: user.projects });
//   } catch (error) {
//     return res.status(500).json({ error: 'Server error' });
//   }
// });




router.post('/user/:email/projects', async (req, res) => {
  const { email } = req.params;
  const { projectName, questions } = req.body;
  console.log(questions)

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const newProject = {
      projectName,
      questions: questions,
    };
    
    user.projects.push(newProject);
    await user.save();
    
    return res.status(201).json({ message: 'Project added', project: newProject });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});




router.put('/user/:email/projects/:projectId/questions', async (req, res) => {
  const { email, projectId } = req.params;
  const { questions } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const project = user.projects.id(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    project.questions = questions;
    await user.save();

    return res.status(200).json({ message: 'Questions updated', questions: project.questions });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});





router.get('/user/:email/projects/:projectId/questions', async (req, res) => {
  const { email, projectId } = req.params;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const project = user.projects.id(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    return res.status(200).json({ questions: project.questions });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
