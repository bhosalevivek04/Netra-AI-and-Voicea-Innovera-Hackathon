"use client";

import { useState, useEffect } from "react";
import Layout from "@/components/Layout"; // Assuming Layout component exists

export default function VideoLectures() {
  const [videos, setVideos] = useState([]);
  const [fullScreenVideo, setFullScreenVideo] = useState(null);

  useEffect(() => {
    // Load saved videos from localStorage
    const savedVideos = JSON.parse(localStorage.getItem("videos")) || [];
    setVideos(savedVideos);
  }, []);

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create Blob URL (Temporary URL, does not consume LocalStorage space)
    const videoUrl = URL.createObjectURL(file);
    const newVideos = [...videos, { name: file.name, url: videoUrl }];

    setVideos(newVideos);
    localStorage.setItem("videos", JSON.stringify(newVideos));
  };

  const handleDelete = (index) => {
    const updatedVideos = videos.filter((_, i) => i !== index);
    setVideos(updatedVideos);
    localStorage.setItem("videos", JSON.stringify(updatedVideos));
  };

  const handleFullScreen = (videoUrl) => {
    setFullScreenVideo(videoUrl);
  };

  const handleCloseFullScreen = () => {
    setFullScreenVideo(null);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
        {/* Heading */}
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Video Lectures</h1>

        {/* Upload Video */}
        <div className="mb-6 w-full max-w-lg">
          <input
            type="file"
            accept="video/*"
            onChange={handleUpload}
            className="block w-full text-lg text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none p-3"
          />
        </div>

        {/* Video List */}
        <div className="w-full max-w-2xl space-y-6">
          {videos.length > 0 ? (
            videos.map((video, index) => (
              <div key={index} className="p-4 bg-white rounded-lg shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{video.name}</h3>

                {/* Video Thumbnail */}
                <video className="w-full rounded" style={{ height: "200px" }} controls>
                  <source src={video.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>

                {/* Buttons */}
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => handleDelete(index)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No videos uploaded yet.</p>
          )}
        </div>

        {/* Full-Screen Video Modal */}
        {fullScreenVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="relative w-full h-full flex items-center justify-center">
              <video controls autoPlay className="w-full h-full">
                <source src={fullScreenVideo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
