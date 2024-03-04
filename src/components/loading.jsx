import React from 'react';
import ReactLoading from 'react-loading';

const Loading = () => {

  return (
    <div className="loading-container">
        <ReactLoading type="spinningBubbles" color="#C6C6C6" height="64px" width="64px" />
    </div>
  );
};

export default Loading;