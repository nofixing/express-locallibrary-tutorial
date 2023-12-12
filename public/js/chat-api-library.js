// chat-api-library.js

const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const chatDeleteButton = document.getElementById('chatDeleteButton');
const chatMessages = document.getElementById('chat-messages');
let previoutChat = '';

$(function () {
  if (chatMessages.innerHTML !== '') {
    $('#chatDeleteId').css('display', 'block');
  } else {
    $('#chatDeleteId').css('display', 'none');
  }
});

// $('#chatDeleteId').css('display', 'none');
chatDeleteButton.addEventListener('click', () => {
  var httpType = 'https://';
  if ($('#hostname').val().indexOf('localhost') > -1) httpType = 'http://';
  $.ajax({
    type: 'POST',
    contentType: 'application/json',
    url:
      httpType +
      $('#hostname').val() +
      '/catalog/chatGPT/' +
      $('#chatGPT_id').val() +
      '/delete',
    async: false,
    success: () => {
      chatMessages.innerHTML = '';
      alert($('#DELETED').val());
      $('#chatDeleteId').css('display', 'none');
    },
  });
});

messageInput.addEventListener('keypress', function (event) {
  // If the user presses the "Enter" key on the keyboard
  if (event.key === 'Enter') {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    sendButton.click();
  }
});

sendButton.addEventListener('click', async () => {
  let userMessage = messageInput.value;

  // Display the user's message in the chat UI with the current timestamp
  const userTimestamp = new Date().toLocaleTimeString();
  let sendUserMsg = '';
  if (previoutChat !== '') {
    sendUserMsg = previoutChat + '\n' + userMessage;
  } else {
    sendUserMsg = userMessage;
  }
  displayMessage('You', userMessage, userTimestamp);

  console.log(`sendUserMsg => ${sendUserMsg}`);
  // Call the server to send the user's message and receive the AI's response
  var httpType = 'https://';
  if ($('#hostname').val().indexOf('localhost') > -1) httpType = 'http://';
  try {
    const response = await fetch(
      httpType + $('#hostname').val() + '/catalog/story/chatWithAI',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: sendUserMsg }],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to send message to server. Status: ${response.status}`
      );
    }

    const data = await response.json();

    // Display the AI's response in the chat UI with the current timestamp
    const aiTimestamp = new Date().toLocaleTimeString();
    let aiRes = data.aiResponse;
    if (aiRes.indexOf('AI') === 0) {
      aiRes = aiRes.substring(3);
    }
    displayMessage('AI', aiRes, aiTimestamp);
  } catch (error) {
    console.error('Error sending message to server:', error.message);
    // Handle error, e.g., display an error message in the UI
  }

  // Clear the input field
  messageInput.value = '';
});

function displayMessage(sender, text, timestamp) {
  const messageElement = document.createElement('div');
  const dispText = text.replace(/(?:\r\n|\r|\n)/g, '<br />');
  messageElement.innerHTML = `
    <div class="message">
      <strong>${sender}</strong><br>${dispText}
    </div>
  `;
  chatMessages.appendChild(messageElement);
  const chatMessage =
    "<br><p><span style='font-size: 1.5em;'><strong>" +
    sender +
    ':&nbsp;&nbsp;' +
    text +
    '</strong></span></p>';
  if (previoutChat === '') {
    previoutChat = sender + ': ' + text;
  } else {
    previoutChat += '\n' + sender + ': ' + text;
  }
  wordList2(chatMessage);
  var saveChatMessage = document.querySelector('#chat-messages').innerHTML;
  saveChatGPT(saveChatMessage);
  $('#chatDeleteId').css('display', 'block');
}
