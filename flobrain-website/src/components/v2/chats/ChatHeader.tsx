type ChatHeaderProps = {
  title: string;
  subtitle: string;
  workspace?: string;
};

export function ChatHeader({ title, subtitle, workspace = "Private workspace" }: ChatHeaderProps) {
  return (
    <header className="fb-v2-chat-header">
      <div>
        <h2 className="fb-v2-chat-title">{title}</h2>
        <p className="fb-v2-chat-subtitle">{subtitle}</p>
      </div>
      <span className="fb-v2-chat-pill">{workspace}</span>
    </header>
  );
}
