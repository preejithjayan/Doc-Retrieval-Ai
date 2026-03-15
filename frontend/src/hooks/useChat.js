import { useEffect, useState } from 'react';

import chatService from '../services/chatService';

export function useChatHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data } = await chatService.history();
        setHistory(data.results || []);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  return { history, setHistory, loading };
}

