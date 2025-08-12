import React from 'react';

import Header from '../views/header';

export default function MyPosts() {
  return (
    <>
    <Header />
    
    
    <div className="my-posts-container">
      <h2>My Posts</h2>
      <p>Here you can add and view your Posts.</p>

      {/* Add logic to display user posts here */}


      <button>Add Post</button>




      
    </div>
    </>
  );
}