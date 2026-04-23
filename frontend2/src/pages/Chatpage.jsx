import React, { useState } from 'react'

const Chatpage = () => {

  const [chats, setChats] = useState([]);

  const fetchchat = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/chats');
      const data = await response.json();
      console.log(data);
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  React.useEffect(() => {
    fetchchat();
  }, []);


  return (
    <div>
        <h1>Welcome to chatpage</h1>
        <div>
          {chats.map((chat) => (
            <div key={chat._id}>
              <h2>{chat.chatName}</h2>
              <p>{chat.message}</p>
            </div>
          ))}

        </div>
    </div>
  )
}

export default Chatpage
