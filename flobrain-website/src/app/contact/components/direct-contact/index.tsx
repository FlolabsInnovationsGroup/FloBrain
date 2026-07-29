import { ExternalLink, Mail, Users, Newspaper } from "lucide-react";

export const DirectContact = () => {
  return (
    <div>
      <h3 className="fb-contact-section-label text-xl font-bold mb-6 uppercase tracking-wider !text-[#2D1B4E] dark:!text-white">
        Direct Contact
      </h3>
      <div className="space-y-4">
        <div className="fb-contact-side-card relative backdrop-blur-md border rounded-xl p-6 shadow-xl group transition-all duration-200 hover:bg-white/10 dark:bg-white/50 dark:border-[#9B8AB8]/40">
          <div className="absolute top-4 right-4 text-[#7A6890]/50 group-hover:text-[#5C4A72] transition-colors dark:text-white/30 dark:group-hover:text-white/50">
            <ExternalLink size={16} />
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <Mail className="text-purple-400" size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold !text-[#2D1B4E] dark:!text-white mb-2">
                Technical Support
              </h4>
              <p className="!text-[#5C4A72] dark:!text-white/80 text-sm mb-3">
                For developers integrating the SDK
              </p>
              <a
                href="mailto:support@flolabs.ai"
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
              >
                support@flolabs.ai
              </a>
            </div>
          </div>
        </div>

        <div className="fb-contact-side-card relative backdrop-blur-md border rounded-xl p-6 shadow-xl group transition-all duration-200 hover:bg-white/10 dark:bg-white/50 dark:border-[#9B8AB8]/40">
          <div className="absolute top-4 right-4 text-[#7A6890]/50 group-hover:text-[#5C4A72] transition-colors dark:text-white/30 dark:group-hover:text-white/50">
            <ExternalLink size={16} />
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <Users className="text-purple-400" size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold !text-[#2D1B4E] dark:!text-white mb-2">Partnerships</h4>
              <p className="!text-[#5C4A72] dark:!text-white/80 text-sm mb-3">
                For device manufacturers
              </p>
              <a
                href="mailto:partners@flolabs.ai"
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
              >
                partners@flolabs.ai
              </a>
            </div>
          </div>
        </div>

        <div className="fb-contact-side-card relative backdrop-blur-md border rounded-xl p-6 shadow-xl group transition-all duration-200 hover:bg-white/10 dark:bg-white/50 dark:border-[#9B8AB8]/40">
          <div className="absolute top-4 right-4 text-[#7A6890]/50 group-hover:text-[#5C4A72] transition-colors dark:text-white/30 dark:group-hover:text-white/50">
            <ExternalLink size={16} />
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <Newspaper className="text-purple-400" size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold !text-[#2D1B4E] dark:!text-white mb-2">Press / Media</h4>
              <p className="!text-[#5C4A72] dark:!text-white/80 text-sm mb-3">
                Media inquiries and press kit
              </p>
              <a
                href="mailto:press@flolabs.ai"
                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
              >
                press@flolabs.ai
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
