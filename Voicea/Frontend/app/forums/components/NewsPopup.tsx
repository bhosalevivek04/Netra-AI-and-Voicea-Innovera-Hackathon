import React from "react";

export default function NewsPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg">
        <h2 className="text-xl font-bold mb-4">News and Announcements</h2>
        <p>📢 We have launched new accessibility features for blind students! Stay tuned for updates.</p>
        <button onClick={onClose} className="mt-4 p-2 bg-red-600 text-white rounded-lg">
          Close
        </button>
      </div>
    </div>
  );
}