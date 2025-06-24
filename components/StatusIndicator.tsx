import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useChatStore } from '@/store/chatStore';
import { validateAPIKeys } from '@/utils/config';

const StatusIndicator: React.FC = () => {
  const { isInitialized, initError, initializeAPI } = useChatStore();
  const [status, setStatus] = useState<'loading' | 'error' | 'ready'>('loading');
  const [message, setMessage] = useState('Initializing...');

  useEffect(() => {
    const checkStatus = async () => {
      if (isInitialized) {
        const validation = validateAPIKeys();
        if (validation.valid) {
          setStatus('ready');
          setMessage('API Ready');
        } else {
          setStatus('error');
          setMessage(validation.errors[0]);
        }
      } else if (initError) {
        setStatus('error');
        setMessage(initError);
      } else {
        setStatus('loading');
        setMessage('Connecting to API...');
      }
    };

    checkStatus();
  }, [isInitialized, initError]);

  const handleRetry = async () => {
    setStatus('loading');
    setMessage('Reconnecting...');
    await initializeAPI();
  };

  return (
    <View style={[styles.container, styles[status]]}>
      <Text style={styles.text}>{message}</Text>
      {status === 'error' && (
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  loading: {
    backgroundColor: '#f0f4f9',
  },
  error: {
    backgroundColor: '#ffebee',
  },
  ready: {
    backgroundColor: '#e8f5e9',
  },
  text: {
    fontSize: 14,
    color: '#333',
  },
  retryButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  retryText: {
    fontSize: 12,
    color: '#333',
  },
});

export default StatusIndicator;