/**
 * TaggedPollCard — Interactive voting and live results component for Tagged text posts.
 */
import { useState } from 'react';
import { BarChart2, CheckCircle2, Check, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaggedPoll } from '@/constants/taggedData';
import { useTagged } from '@/stores/taggedContext';

interface TaggedPollCardProps {
  postId: string;
  poll: TaggedPoll;
  isAuthor?: boolean;
}

export default function TaggedPollCard({ postId, poll, isAuthor = false }: TaggedPollCardProps) {
  const { votePoll, getUserPollVote } = useTagged();
  const userVotedOptionId = getUserPollVote(postId) || poll.user_voted_option_id;
  const [showResultsOnly, setShowResultsOnly] = useState(false);

  const hasVoted = Boolean(userVotedOptionId);
  const totalVotes = poll.total_votes || 0;

  // Calculate highest voted option for winner highlight
  const maxVotes = Math.max(...poll.options.map((o) => o.votes), 0);

  const handleVote = (e: React.MouseEvent, optionId: string) => {
    e.stopPropagation();
    votePoll(postId, optionId);
    setShowResultsOnly(false);
  };

  const handleToggleViewResults = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowResultsOnly((prev) => !prev);
  };

  // Determine if we should display percentage bars
  const showResults = hasVoted || showResultsOnly || isAuthor;

  // Calculate time remaining representation
  const getTimeRemaining = () => {
    if (!poll.ends_at) return 'Active poll';
    const end = new Date(poll.ends_at).getTime();
    const now = Date.now();
    const diffHours = Math.round((end - now) / (1000 * 60 * 60));
    if (diffHours <= 0) return 'Final results';
    if (diffHours < 24) return `${diffHours}h left`;
    const days = Math.round(diffHours / 24);
    return `${days}d left`;
  };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="rounded-2xl border border-white/12 bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-3 sm:p-3.5 mb-3 select-none backdrop-blur-sm shadow-inner"
    >
      {/* Poll Header */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
            <BarChart2 size={13} />
          </div>
          <span className="text-xs font-semibold text-white/90 truncate">
            {poll.question || 'Community Poll'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-white/50 shrink-0 font-medium">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <Clock size={11} className="text-white/40" />
            <span>{getTimeRemaining()}</span>
          </span>
        </div>
      </div>

      {/* Options List */}
      <div className="space-y-2">
        {poll.options.map((option, index) => {
          const isSelected = userVotedOptionId === option.id;
          const isLeader = maxVotes > 0 && option.votes === maxVotes && totalVotes > 0;
          const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

          if (showResults) {
            // Results Bar Mode
            return (
              <div
                key={option.id}
                onClick={(e) => handleVote(e, option.id)}
                className={cn(
                  'relative overflow-hidden rounded-xl border p-2.5 transition-all group/opt cursor-pointer',
                  isSelected
                    ? 'border-emerald-500/40 bg-emerald-500/[0.08]'
                    : isLeader
                    ? 'border-white/20 bg-white/[0.04]'
                    : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20'
                )}
                title="Click to vote or switch your choice"
              >
                {/* Animated fill progress bar */}
                <div
                  className={cn(
                    'absolute inset-y-0 left-0 transition-all duration-700 ease-out rounded-xl',
                    isSelected
                      ? 'bg-gradient-to-r from-emerald-500/30 to-emerald-500/15'
                      : isLeader
                      ? 'bg-gradient-to-r from-white/20 to-white/10'
                      : 'bg-white/[0.08]'
                  )}
                  style={{ width: `${Math.max(percentage, 2)}%` }}
                />

                {/* Content Overlay */}
                <div className="relative z-10 flex items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <span className="font-mono text-[11px] text-white/40 shrink-0 w-3">
                      {index + 1}.
                    </span>
                    <span
                      className={cn(
                        'truncate text-[12px] sm:text-[13px]',
                        isSelected ? 'text-white font-semibold' : 'text-white/85'
                      )}
                    >
                      {option.text}
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] sm:text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                        <Check size={9} />
                        <span>Voted</span>
                      </span>
                    )}
                    {isLeader && !isSelected && totalVotes > 1 && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] text-amber-300/80 shrink-0" title="Leading option">
                        <Sparkles size={9} />
                        <span>Lead</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 font-mono text-xs">
                    <span className="text-[11px] text-white/45 hidden sm:inline">
                      {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                    </span>
                    <span
                      className={cn(
                        'text-[12px] sm:text-[13px] font-bold min-w-[32px] text-right',
                        isSelected ? 'text-emerald-400' : isLeader ? 'text-white' : 'text-white/70'
                      )}
                    >
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          // Interactive Ballot Voting Mode
          return (
            <button
              key={option.id}
              type="button"
              onClick={(e) => handleVote(e, option.id)}
              className="w-full text-left rounded-xl border border-white/15 bg-white/[0.04] hover:bg-emerald-500/10 hover:border-emerald-500/40 p-2.5 transition-all group/btn flex items-center justify-between gap-3 active:scale-[0.99] touch-manipulation"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-4 w-4 rounded-full border border-white/30 group-hover/btn:border-emerald-400 group-hover/btn:bg-emerald-400/20 transition-all flex items-center justify-center shrink-0">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                </div>
                <span className="text-[13px] text-white/90 group-hover/btn:text-white truncate font-medium">
                  {option.text}
                </span>
              </div>

              <span className="text-[11px] text-white/40 group-hover/btn:text-emerald-300 font-mono shrink-0 transition-colors">
                Vote
              </span>
            </button>
          );
        })}
      </div>

      {/* Poll Footer */}
      <div className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-2 text-[11px] text-white/45">
        <div className="flex items-center gap-2">
          <span className="font-medium text-white/70">
            {totalVotes} {totalVotes === 1 ? 'total vote' : 'total votes'}
          </span>
          {hasVoted && (
            <>
              <span className="text-white/20">·</span>
              <span className="text-emerald-400/90 font-medium flex items-center gap-1">
                <CheckCircle2 size={11} />
                <span>Voted</span>
              </span>
            </>
          )}
        </div>

        <div>
          {!hasVoted && !isAuthor && (
            <button
              type="button"
              onClick={handleToggleViewResults}
              className="hover:text-white transition-colors underline underline-offset-2 touch-manipulation"
            >
              {showResultsOnly ? 'Hide live results' : 'View results without voting'}
            </button>
          )}
          {hasVoted && (
            <span className="text-white/40 text-[10px]">
              Tap any option to change vote
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
