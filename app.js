const express = require("express");
const cors = require("cors");
const mainPort = 8000;

const app = express();
app.use(cors());

app.get("/api/v1/package", (req, res) => {
  res.status(200).send({
    message: "Success",
    data: [
      {
        id: 1,
        name: "Bronze",
        amount: "0.00",
        description: "This is a free Package available for 1 month",
      },
    ],
  });
});

app.all("*", (req, res) =>
  res.status(404).send({
    status: "error",
    message: "you have entered an incorrect route",
  })
);

app.listen(mainPort, () =>
  console.log(`Welcome to your live mock server, listening on ${mainPort}`)
);
