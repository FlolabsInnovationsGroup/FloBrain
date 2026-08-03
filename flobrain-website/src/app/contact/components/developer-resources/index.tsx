import { ExternalLink, FileText, Activity, Github, MessageCircle } from "lucide-react";

export const DeveloperResources = () => {
  return (
    <div className="fb-contact-side-card backdrop-blur-md border rounded-2xl p-8 shadow-2xl dark:bg-white/50 dark:border-[#9B8AB8]/40">
      <h3 className="text-2xl font-bold !text-[#2D1B4E] dark:!text-white mb-6 uppercase tracking-wider">
        Developer Resources
      </h3>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <FileText className="text-purple-400" size={18} />
            </div>
            <div>
              <h4 className="font-semibold !text-[#2D1B4E] dark:!text-white text-sm">
                API Documentation
              </h4>
              <p className="!text-[#5C4A72] dark:!text-white/80 text-xs">Complete integration guides</p>
            </div>
          </div>
          <ExternalLink
            className="text-[#7A6890] group-hover:text-[#5C4A72] transition-colors dark:text-white/40 dark:group-hover:text-white/60"
            size={16}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="bg-green-500/20 p-2 rounded-lg">
              <Activity className="text-green-400" size={18} />
            </div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold !text-[#2D1B4E] dark:!text-white text-sm">System Status</h4>
              <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full font-medium">
                99.9% Uptime
              </span>
            </div>
          </div>
          <ExternalLink
            className="text-[#7A6890] group-hover:text-[#5C4A72] transition-colors dark:text-white/40 dark:group-hover:text-white/60"
            size={16}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <Github className="text-purple-400" size={18} />
            </div>
            <div>
              <h4 className="font-semibold !text-[#2D1B4E] dark:!text-white text-sm">GitHub</h4>
              <p className="!text-[#5C4A72] dark:!text-white/80 text-xs">Open source SDKs</p>
            </div>
          </div>
          <ExternalLink
            className="text-[#7A6890] group-hover:text-[#5C4A72] transition-colors dark:text-white/40 dark:group-hover:text-white/60"
            size={16}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-white/60 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group">
          <div className="flex items-center gap-4">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <MessageCircle className="text-purple-400" size={18} />
            </div>
            <div>
              <h4 className="font-semibold !text-[#2D1B4E] dark:!text-white text-sm">
                Discord Community
              </h4>
              <p className="!text-[#5C4A72] dark:!text-white/80 text-xs">Join 5,000+ developers</p>
            </div>
          </div>
          <ExternalLink
            className="text-[#7A6890] group-hover:text-[#5C4A72] transition-colors dark:text-white/40 dark:group-hover:text-white/60"
            size={16}
          />
        </div>
      </div>
    </div>
  );
};
