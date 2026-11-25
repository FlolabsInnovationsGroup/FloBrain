"use client";

import { ArrowRight, ClipboardCheck, FileText, Info } from "lucide-react";
import Link from "next/link";
import { ChatScreen } from "./ChatScreen";
import type { TeamRoom } from "./chatTypes";

export function TeamRoomScreen({ room }: { room: TeamRoom }) {
  return (
    <ChatScreen
      title={room.name}
      subtitle={`Team room · ${room.members.length} members`}
      workspace="Team workspace"
      composerPlaceholder="Message your team room..."
      renderWelcome={(send) => (
        <>
          <p className="fb-v2-chat-notice">
            <Info size={14} aria-hidden="true" />
            Answers use only the files and conversations in this room.
          </p>
          <h2 className="fb-v2-chat-hero">A shared space to think better.</h2>
          <p className="fb-v2-chat-lede">
            Ask a question, explore an idea, or catch up on the project.
          </p>
          <div className="fb-v2-chat-cards fb-v2-chat-cards-2">
            {room.suggestions.map((suggestion, index) => {
              const Icon = index === 0 ? FileText : ClipboardCheck;
              return (
                <button
                  key={suggestion.id}
                  type="button"
                  className="fb-v2-chat-card fb-v2-chat-card-row"
                  onClick={() => send(suggestion.prompt)}
                >
                  <Icon size={16} aria-hidden="true" />
                  <span className="fb-v2-chat-card-col">
                    <span className="fb-v2-chat-card-title">{suggestion.title}</span>
                    <span className="fb-v2-chat-card-text">Use this prompt</span>
                  </span>
                </button>
              );
            })}
          </div>
          <section className="fb-v2-chat-section" aria-labelledby="fb-v2-room-resources">
            <p id="fb-v2-room-resources" className="fb-v2-chat-kicker">
              Room resources
            </p>
            {room.resources.map((resource) => (
              <Link key={resource.id} href="/docs" className="fb-v2-chat-card fb-v2-chat-card-row">
                <FileText size={18} aria-hidden="true" />
                <span className="fb-v2-chat-card-col">
                  <span className="fb-v2-chat-card-title">{resource.title}</span>
                  <span className="fb-v2-chat-card-text">{resource.meta}</span>
                </span>
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            ))}
          </section>
          <p className="fb-v2-chat-members">Team members: {room.members.join(", ")}</p>
        </>
      )}
    />
  );
}
