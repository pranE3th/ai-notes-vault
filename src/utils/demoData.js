// Demo data for the AI Notes Vault application
// This can be used to populate the app with sample notes for demonstration

export const demoNotes = [
  {
    id: 'demo-1',
    title: 'Welcome to AI Notes Vault',
    content: `<h2>Welcome to your AI-powered note-taking experience!</h2>
    
    <p>This is your first note in the AI Notes Vault. Here are some key features you can explore:</p>
    
    <ul>
      <li><strong>Rich Text Editing:</strong> Format your notes with headers, lists, bold, italic, and more</li>
      <li><strong>Auto-Save:</strong> Your notes are automatically saved as you type</li>
      <li><strong>AI Summarization:</strong> Get automatic summaries of your longer notes</li>
      <li><strong>Smart Tagging:</strong> AI suggests relevant tags for your content</li>
      <li><strong>Semantic Search:</strong> Find notes by meaning, not just keywords</li>
    </ul>
    
    <p>Try creating a new note and watch the AI features in action!</p>`,
    summary: 'Welcome note introducing the key features of AI Notes Vault including rich text editing, auto-save, AI summarization, smart tagging, and semantic search.',
    tags: ['welcome', 'tutorial', 'features', 'getting-started'],
    ownerId: 'demo-user',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    versions: []
  },
  {
    id: 'demo-2',
    title: 'Project Planning: AI Integration',
    content: `<h2>AI Integration Project Plan</h2>
    
    <h3>Phase 1: Research & Analysis</h3>
    <ul>
      <li>Evaluate different AI APIs (OpenAI, Anthropic, Google)</li>
      <li>Analyze user requirements and use cases</li>
      <li>Create technical specifications</li>
    </ul>
    
    <h3>Phase 2: Implementation</h3>
    <ul>
      <li>Set up API integrations</li>
      <li>Implement summarization features</li>
      <li>Add semantic search capabilities</li>
      <li>Create smart tagging system</li>
    </ul>
    
    <h3>Phase 3: Testing & Optimization</h3>
    <ul>
      <li>User acceptance testing</li>
      <li>Performance optimization</li>
      <li>Security audit</li>
    </ul>
    
    <p><strong>Timeline:</strong> 8-10 weeks</p>
    <p><strong>Budget:</strong> $50,000</p>`,
    summary: 'Project plan for AI integration featuring three phases: research & analysis, implementation of AI features, and testing & optimization. Timeline: 8-10 weeks, Budget: $50,000.',
    tags: ['project-planning', 'ai', 'integration', 'timeline', 'budget'],
    ownerId: 'demo-user',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    versions: []
  },
  {
    id: 'demo-3',
    title: 'Meeting Notes: Team Standup',
    content: `<h2>Daily Standup - March 15, 2024</h2>
    
    <h3>Attendees:</h3>
    <ul>
      <li>John Smith (Product Manager)</li>
      <li>Sarah Johnson (Lead Developer)</li>
      <li>Mike Chen (UI/UX Designer)</li>
      <li>Lisa Wang (QA Engineer)</li>
    </ul>
    
    <h3>Updates:</h3>
    <p><strong>John:</strong> Completed user story prioritization, working on sprint planning</p>
    <p><strong>Sarah:</strong> Fixed authentication bugs, starting on search feature implementation</p>
    <p><strong>Mike:</strong> Finished dashboard mockups, gathering feedback from stakeholders</p>
    <p><strong>Lisa:</strong> Completed testing of note editor, found 3 minor issues</p>
    
    <h3>Blockers:</h3>
    <ul>
      <li>Waiting for API key approval from OpenAI</li>
      <li>Need design approval for mobile layout</li>
    </ul>
    
    <h3>Action Items:</h3>
    <ul>
      <li>John: Follow up on API key approval</li>
      <li>Mike: Schedule design review meeting</li>
      <li>Sarah: Create tickets for Lisa's bug reports</li>
    </ul>`,
    summary: 'Daily standup meeting notes with team updates, blockers including API key approval and design review, and action items for follow-up.',
    tags: ['meeting-notes', 'standup', 'team', 'action-items', 'blockers'],
    ownerId: 'demo-user',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    versions: []
  },
  {
    id: 'demo-4',
    title: 'Recipe: Chocolate Chip Cookies',
    content: `<h2>Best Chocolate Chip Cookies Ever</h2>
    
    <h3>Ingredients:</h3>
    <ul>
      <li>2¼ cups all-purpose flour</li>
      <li>1 tsp baking soda</li>
      <li>1 tsp salt</li>
      <li>1 cup butter, softened</li>
      <li>¾ cup granulated sugar</li>
      <li>¾ cup packed brown sugar</li>
      <li>2 large eggs</li>
      <li>2 tsp vanilla extract</li>
      <li>2 cups chocolate chips</li>
    </ul>
    
    <h3>Instructions:</h3>
    <ol>
      <li>Preheat oven to 375°F (190°C)</li>
      <li>Mix flour, baking soda, and salt in a bowl</li>
      <li>Beat butter and sugars until creamy</li>
      <li>Add eggs and vanilla, beat well</li>
      <li>Gradually blend in flour mixture</li>
      <li>Stir in chocolate chips</li>
      <li>Drop rounded tablespoons onto ungreased cookie sheets</li>
      <li>Bake 9-11 minutes or until golden brown</li>
      <li>Cool on baking sheet for 2 minutes, then transfer to wire rack</li>
    </ol>
    
    <p><strong>Yield:</strong> About 48 cookies</p>
    <p><strong>Prep Time:</strong> 15 minutes</p>
    <p><strong>Bake Time:</strong> 9-11 minutes per batch</p>`,
    summary: 'Classic chocolate chip cookie recipe with detailed ingredients list and step-by-step instructions. Yields about 48 cookies with 15 minutes prep time.',
    tags: ['recipe', 'baking', 'cookies', 'dessert', 'chocolate'],
    ownerId: 'demo-user',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    versions: []
  },
  {
    id: 'demo-5',
    title: 'Learning Notes: React Hooks',
    content: `<h2>React Hooks - Key Concepts</h2>
    
    <h3>useState Hook</h3>
    <p>Manages state in functional components. Returns an array with current state and setter function.</p>
    <pre><code>const [count, setCount] = useState(0);</code></pre>
    
    <h3>useEffect Hook</h3>
    <p>Handles side effects like API calls, subscriptions, or DOM manipulation.</p>
    <pre><code>useEffect(() => {
      // Effect logic here
      return () => {
        // Cleanup logic here
      };
    }, [dependencies]);</code></pre>
    
    <h3>useContext Hook</h3>
    <p>Consumes context values without wrapping components in Consumer.</p>
    <pre><code>const value = useContext(MyContext);</code></pre>
    
    <h3>Custom Hooks</h3>
    <p>Reusable stateful logic that can be shared between components.</p>
    <ul>
      <li>Must start with "use"</li>
      <li>Can call other hooks</li>
      <li>Return values that components need</li>
    </ul>
    
    <h3>Rules of Hooks</h3>
    <ol>
      <li>Only call hooks at the top level</li>
      <li>Only call hooks from React functions</li>
      <li>Use ESLint plugin for enforcement</li>
    </ol>`,
    summary: 'Comprehensive notes on React Hooks covering useState, useEffect, useContext, custom hooks, and the rules of hooks with code examples.',
    tags: ['react', 'hooks', 'javascript', 'programming', 'learning'],
    ownerId: 'demo-user',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    versions: []
  }
];

/**
 * Load demo data into localStorage
 * This function can be called to populate the app with sample notes
 */
export function loadDemoData() {
  const existingNotes = JSON.parse(localStorage.getItem('notes') || '[]');
  
  // Only load demo data if no notes exist
  if (existingNotes.length === 0) {
    localStorage.setItem('notes', JSON.stringify(demoNotes));
    console.log('Demo data loaded successfully!');
    return true;
  }
  
  console.log('Notes already exist, demo data not loaded');
  return false;
}

/**
 * Clear all notes and reload demo data
 */
export function resetToDemoData() {
  localStorage.setItem('notes', JSON.stringify(demoNotes));
  console.log('Reset to demo data successfully!');
  return true;
}
