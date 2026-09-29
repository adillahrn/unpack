import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import PaxChat from '@/components/PaxChat';

/**
 * Floating Action Button that opens the Pax AI chatbot.
 * Rendered in AppLayout so it appears on every page.
 * If user is not logged in, clicking redirects to /login.
 *
 * Positioning:
 *   - Mobile: bottom-20 to clear the mobile bottom-nav bar (z-50)
 *   - Desktop (lg+): bottom-6
 *   - Right: right-5
 *   - z-[60]: above bottom-nav (z-50) but below PaxChat overlay (z-[100])
 */
export default function PaxChatFAB() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => {
      if (session) {
        setIsOpen(true);
      } else {
        navigate('/login');
      }
    };
    window.addEventListener('open-pax-chat', handleOpen);
    return () => window.removeEventListener('open-pax-chat', handleOpen);
  }, [session, navigate]);

  const handleClick = () => {
    if (!session) {
      navigate('/login');
      return;
    }
    setIsOpen((prev) => !prev);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        type="button"
        onClick={handleClick}
        aria-label={isOpen ? 'Close Pax Chat' : 'Open Pax Chat'}
        className={`
          fixed right-5 z-[60]
          bottom-20 lg:bottom-6
          w-14 h-14
          rounded-full
          flex items-center justify-center
          shadow-[0_4px_0_#5516be] hover:translate-y-[1px] hover:shadow-[0_3px_0_#5516be]
          active:translate-y-[4px] active:shadow-none
          transition-all duration-200 cursor-pointer
          ${isOpen
            ? 'bg-surface-container-high text-on-surface rotate-0'
            : 'bg-primary text-on-primary animate-[fabBounceIn_0.5s_ease-out]'
          }
        `}
      >
        {isOpen ? (
          <span
            className="material-symbols-outlined text-[24px] transition-transform duration-200"
            style={{ fontVariationSettings: "'FILL' 0" }}
          >
            close
          </span>
        ) : (
          <img
            src="/unpack_logo.png"
            alt="Pax Chat"
            className="w-8 h-8 object-contain animate-[logoZoomInOut_2.5s_ease-in-out_infinite]"
          />
        )}
      </button>

      {/* Pax Chat overlay */}
      {session && isOpen && <PaxChat onClose={() => setIsOpen(false)} />}
    </>
  );
}
