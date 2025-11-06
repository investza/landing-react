import React from 'react';

const ExpertMedia = ({ videoSrc, imageSrc, alt }) => {
  return (
    <div className="expert-image">
      <video autoPlay muted loop playsInline>
        <source src={videoSrc} type="video/mp4" />
        <img src={imageSrc} alt={alt} />
      </video>
    </div>
  );
};

export default ExpertMedia;