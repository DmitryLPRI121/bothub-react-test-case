import React, { useEffect, useRef, useState } from 'react';
import './ChatBot.css';
import ChatService from '../service/chat';
import Markdown from 'react-markdown';

type Role = 'user' | 'assistant';
type Message = { role: Role; text: string; CAPS?: number };

function ChatBot() {

  const [text, setText] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageIsLoading, setMessageIsLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState('.');

  const [includeContext, setIncludeContext] = useState<boolean | null>(null);

  const [totalCAPS, setTotalCAPS] = useState<number>(10000);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    setText(value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '2.1em';
    }
    if (localStorage.getItem('includeContext')) {
      setIncludeContext(JSON.parse(localStorage.getItem('includeContext') || ''));
    } else {
      setIncludeContext(false);
      localStorage.setItem('includeContext', JSON.stringify(false));
    }
    if (localStorage.getItem('messages')) {
      setMessages(JSON.parse(localStorage.getItem('messages') || ''));
    } else {
      setMessages([
        ...messages,
        { role: 'assistant', text: 'Hi there! I am a Gemini bot. Ask me anything!', CAPS: 0 },
      ]);
      setTotalCAPS(10000);
    }
  }, []);

  useEffect(() => {
    if (includeContext !== null)
      localStorage.setItem('includeContext', JSON.stringify(includeContext));
  }, [includeContext]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
    if (messages.length > 0) {
      localStorage.setItem('messages', JSON.stringify(messages));
      let minusTotalCaps = messages.reduce((total, message) => {
        if (message.CAPS !== undefined && message.CAPS >= 0) {
          total += message.CAPS;
        }
        return total;
      }, 0);

      setTotalCAPS(10000 - minusTotalCaps);
    }
  }, [messages]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (messageIsLoading) {
      timer = setInterval(() => {
        setLoadingText((prevText) => {
          switch (prevText) {
            case '.':
              return '..';
            case '..':
              return '...';
            case '...':
              return '.';
            default:
              return '.';
          }
        });
      }, 500);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [messageIsLoading]);

  const sendPrompt = async () => {
    if (text && text.length > 0) {
      setText('');
      setMessageIsLoading(true);
      setMessages(prevMessages => [...prevMessages, { role: 'user', text: text }]);
      await ChatService.sendPrompt(JSON.stringify({ message: text })).then((res) => {
        setMessages(prevMessages => [...prevMessages, { role: 'assistant', text: res?.message || '', CAPS: res?.CAPS || 0, totalCAPS: res?.totalCAPS || 0 }]);
      });
      setMessageIsLoading(false);
    }
  }

  return (
    <div className="chat">
      <div className='chat-field'>
        <div className='header'>
          <div>
            <img src="https://bothub.chat/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ficon-128x128.986912ab.png&w=828&q=75" alt="BotHub logo" />
            <div>
              <p>BotHub: Try for free</p>
              <p>Bot</p>
            </div>
          </div>
          <div className='include-context'>
            <p>Include context</p>
            <input
              type="checkbox"
              checked={includeContext === null ? false : includeContext}
              onChange={() => setIncludeContext(!includeContext)}
            />
          </div>
        </div>
        <div ref={contentRef} className='content' id="content-scrollbar">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role === 'user' ? 'user' : 'assistant'}`}>
              {message.role === 'user' ? (
                <>
                  <p className="text">
                    {message.text}
                  </p>
                  <object data="data:image/png;base64,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" width="40" height="40" type="image/jpeg">
                    <img src="data:image/png;base64,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" width="40" height="40" />
                  </object>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="40" height="40" fill="none"><rect width="24" height="24" rx="12" fill="#112441"></rect><path d="M20 12.016C17.9242 12.1434 15.9666 13.0255 14.496 14.496C13.0255 15.9666 12.1434 17.9242 12.016 20H11.984C11.8568 17.9241 10.9748 15.9664 9.5042 14.4958C8.03358 13.0252 6.07588 12.1432 4 12.016V11.984C6.07588 11.8568 8.03358 10.9748 9.5042 9.5042C10.9748 8.03358 11.8568 6.07588 11.984 4H12.016C12.1434 6.07581 13.0255 8.03339 14.496 9.50397C15.9666 10.9745 17.9242 11.8566 20 11.984V12.016Z" fill="url(#paint0_radial_1671_304)"></path><defs><radialGradient id="paint0_radial_1671_304" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(5.588 10.503) rotate(18.6832) scale(17.03 136.421)"><stop offset="0.067" stopColor="#9168C0"></stop><stop offset="0.343" stopColor="#5684D1"></stop><stop offset="0.672" stopColor="#1BA1E3"></stop></radialGradient></defs></svg>
                  <div>
                    <div>
                      <p>Gemini <span>gemini-pro</span></p>
                      {message.CAPS ? <p>-{message.CAPS} CAPS</p> : <p></p>}
                    </div>
                    <p className="text">
                      <Markdown>{message.text}</Markdown>
                    </p>
                  </div>
                </>
              )}
            </div>
          ))}
          {messageIsLoading && <div className="message assistant" id="loading-message">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="none"><rect width="24" height="24" rx="12" fill="#112441"></rect><path d="M20 12.016C17.9242 12.1434 15.9666 13.0255 14.496 14.496C13.0255 15.9666 12.1434 17.9242 12.016 20H11.984C11.8568 17.9241 10.9748 15.9664 9.5042 14.4958C8.03358 13.0252 6.07588 12.1432 4 12.016V11.984C6.07588 11.8568 8.03358 10.9748 9.5042 9.5042C10.9748 8.03358 11.8568 6.07588 11.984 4H12.016C12.1434 6.07581 13.0255 8.03339 14.496 9.50397C15.9666 10.9745 17.9242 11.8566 20 11.984V12.016Z" fill="url(#paint0_radial_1671_304)"></path><defs><radialGradient id="paint0_radial_1671_304" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(5.588 10.503) rotate(18.6832) scale(17.03 136.421)"><stop offset="0.067" stopColor="#9168C0"></stop><stop offset="0.343" stopColor="#5684D1"></stop><stop offset="0.672" stopColor="#1BA1E3"></stop></radialGradient></defs></svg>
            <p>{loadingText}</p>
          </div>}
        </div>
        <div className='input'>

          <div className='gradient-bg' />

          <p>
            Caps remaining: <span>{totalCAPS ? totalCAPS.toLocaleString("ru") : '10 000'}</span>
          </p>

          <textarea
            value={text || ''}
            ref={textareaRef}
            onChange={handleInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendPrompt();
              }
            }}
            rows={1} cols={1}
            placeholder='Write a prompt...'
          />

          <button onClick={sendPrompt}>
            <svg viewBox="0 0 18 19" width="18" height="18" fill="none"><g clipPath="url(#clip0_338_11089)"><path d="M16.9161 3.6004C17.3086 2.65022 16.2564 1.72946 15.1705 2.07375L1.8994 6.27362C0.80991 6.6187 0.678153 7.91954 1.68041 8.42762L5.91663 10.5737L9.69942 7.26355C9.87079 7.11871 10.1003 7.03857 10.3386 7.04038C10.5768 7.04219 10.8047 7.12582 10.9732 7.27324C11.1417 7.42066 11.2372 7.62009 11.2393 7.82857C11.2414 8.03705 11.1498 8.2379 10.9843 8.38787L7.20149 11.698L9.65489 15.4049C10.2346 16.2819 11.7212 16.1658 12.1156 15.2133L16.9161 3.6004Z" fill="#FFFFFF"></path></g><defs><clipPath id="clip0_338_11089"><rect width="18" height="18" fill="white" transform="translate(0 0.5)"></rect></clipPath></defs></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatBot;