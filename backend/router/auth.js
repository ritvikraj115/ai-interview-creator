const express = require('express');
const OpenAI = require('openai');
const axios = require('axios');
const User = require('../userSchema'); // Assuming your user schema is in this folder
const Retell = require('retell-sdk');

const router = express.Router();
const openai = new OpenAI({
  apiKey: 'sk-KIEEOiqKof10-FKq39pFBuO2_SkBPkptlR0Msqi694T3BlbkFJ4CGei82vtQxVW0w8kxFbytM1DP7x9eTrNer-72gSIA',
});
const retellClient = new Retell({
  apiKey: 'key_0aa931aff9f9c94a0a867ec70400'
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
          content: `You are a highly intelligent assistant responsible for generating a well-structured, chronological set of user-specific questions based on a project's name, offering, and desired feedback. The questions should follow a natural flow, beginning with basic inquiries and gradually progressing to more advanced or in-depth topics. Each question should build on the previous one, guiding the user through a logical path that encourages detailed and thoughtful responses. For example, if the project focuses on AI healthcare, questions should start by addressing general health concerns and gradually lead to more specific inquiries about the user’s medical history or expectations for the solution. Ensure that the questions are clear, relevant, and designed to enhance the value of the conversation by extracting useful insights from the user in a structured manner`
        },
        {
          role: 'user',
          content: `The project name is "${projectName}". The project is offering "${projectOffering}". The desired feedback focuses on "${feedbackDesired}". Please generate a set of 2-3 interview questions following these fields, starting with general project-related questions and moving toward more specific feedback-driven questions.`,
        },
      ],
      max_tokens: 50,  // Set the token limit high enough to generate multiple questions
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
