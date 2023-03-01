const { Novu } = require("@novu/node");
const novu = new Novu("89af7968f8d1d4826598db29b8c53360");

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 4000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.get("/api", (req, res) => {
  res.json({
    message: "Hello world",
  });
});

//👇🏻 holds all the existing users
const users = [];
//👇🏻 generates a random string as ID
const generateID = () => Math.random().toString(36).substring(2, 10);

app.post("/api/register", async (req, res) => {
  const { email, password, username } = req.body;
  const id = generateID();
  const result = users.filter(
    (user) => user.email === email && user.password === password
  );

  if (result.length === 0) {
    const newUser = { id, email, password, username };
    //👇🏻 add the user as a subscriber
    await novu.subscribers.identify(id, { email: email });

    users.push(newUser);
    return res.json({
      message: "Account created successfully!",
    });
  }
  res.json({
    error_message: "User already exists",
  });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  //👇🏻 checks if the user exists
  let result = users.filter(
    (user) => user.email === email && user.password === password
  );
  //👇🏻 if the user doesn't exist
  if (result.length !== 1) {
    return res.json({
      error_message: "Incorrect credentials",
    });
  }
  //👇🏻 Returns the id if successfuly logged in
  res.json({
    message: "Login successfully",
    id: result[0].id,
  });
});

app.post("/api/create/thread", async (req, res) => {
  const { thread, userId } = req.body;
  let threadId = generateID();
  threadList.unshift({
    id: threadId,
    title: thread,
    userId,
    replies: [],
    likes: [],
  });
  //👇🏻 creates a new topic from the post
  await novu.topics.create({
    key: threadId,
    name: thread,
  });
  //👇🏻 add the user as a subscriber
  await novu.topics.addSubscribers(threadId, {
    subscribers: [userId],
    //replace with your subscriber ID to test run
    // subscribers: ["<YOUR_SUBSCRIBER_ID>"],
  });

  res.json({
    message: "Thread created successfully!",
    threads: threadList,
  });
});

const threadList = [];

app.post("/api/create/thread", async (req, res) => {
  const { thread, userId } = req.body;
  const threadId = generateID();

  //👇🏻 add post details to the array
  threadList.unshift({
    id: threadId,
    title: thread,
    userId,
    replies: [],
    likes: [],
  });

  //👇🏻 Returns a response containing the posts
  res.json({
    message: "Thread created successfully!",
    threads: threadList,
  });
});

app.get("/api/all/threads", (req, res) => {
  res.json({
    threads: threadList,
  });
});

app.post("/api/thread/like", (req, res) => {
  //👇🏻 accepts the post id and the user id
  const { threadId, userId } = req.body;
  //👇🏻 gets the reacted post
  const result = threadList.filter((thread) => thread.id === threadId);
  //👇🏻 gets the likes property
  const threadLikes = result[0].likes;
  //👇🏻 authenticates the reaction
  const authenticateReaction = threadLikes.filter((user) => user === userId);
  //👇🏻 adds the users to the likes array
  if (authenticateReaction.length === 0) {
    threadLikes.push(userId);
    return res.json({
      message: "You've reacted to the post!",
    });
  }
  //👇🏻 Returns an error user has reacted to the post earlier
  res.json({
    error_message: "You can only react once!",
  });
});

app.post("/api/thread/replies", (req, res) => {
  //👇🏻 The post ID
  const { id } = req.body;
  //👇🏻 searches for the post
  const result = threadList.filter((thread) => thread.id === id);
  //👇🏻 return the title and replies
  res.json({
    replies: result[0].replies,
    title: result[0].title,
  });
});

app.post("/api/create/reply", async (req, res) => {
  const { id, userId, reply } = req.body;
  const result = threadList.filter((thread) => thread.id === id);
  const user = users.filter((user) => user.id === userId);
  result[0]?.replies.unshift({ name: user[0].username, text: reply });
  //👇🏻 Triggers the function when there is a new reply
  await novu.trigger("topicnotification", {
    to: [{ type: "Topic", topicKey: id }],
  });

  res.json({
    message: "Response added successfully!",
  });
});
// // // // //
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
