export default function HelpSettings() {
  const helpTopics = [
    { title: "Getting Started", description: "Learn the basics of using the platform" },
    { title: "Account Management", description: "Manage your account settings and preferences" },
    { title: "Privacy & Security", description: "Understand how we protect your data" },
    { title: "Contact Support", description: "Get in touch with our support team" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-white">Help</h2>

      <div className="space-y-4">
        {helpTopics.map((topic, index) => (
          <button
            key={index}
            className="w-full text-left p-4 bg-indigo-950/30 border border-purple-500/20 rounded-lg hover:bg-indigo-950/50 hover:border-purple-500/40 transition-colors group"
          >
            <h3 className="text-white font-semibold text-lg group-hover:text-purple-300 transition-colors">
              {topic.title}
            </h3>
            <p className="text-white/60 text-sm mt-1">{topic.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
