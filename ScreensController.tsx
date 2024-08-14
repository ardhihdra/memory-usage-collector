import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import GlobalStyle from 'styles/index';

import { IAssets, ILive } from '@/interfaces/context';
import { useLive } from '@/store/live';
import { useAssets, useNetwork, useQuality, useSendSocketToServer } from '@/store/network';
import { usePreview } from '@/store/preview';

import Slideshow, { SlideshowProps } from '@/containers/Slideshow';

import Wrapper from './styles';

const controller = new AbortController();
const signal = controller.signal;
const postData = async () => {
  const url = 'http://localhost:3001/api/data';
  const memoryInfo = window.performance.memory;
  const memoryInMB = {
    usedJSHeapSize: memoryInfo.usedJSHeapSize / 1048576,
    totalJSHeapSize: memoryInfo.totalJSHeapSize / 1048576,
    jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit / 1048576
  };
  const data = { time: new Date().toISOString(), memory: memoryInMB };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    signal
  });

  await response.text();
};

const ScreensController = ({
  preview = false,
  live,
  network,
  quality,
  sendSocketToServer = () => Promise.resolve(),
  assets,
  ...props
}: SlideshowProps & {
  live?: ILive;
  preview?: boolean;
  sendSocketToServer?: (data: any) => Promise<any>;
  network?: string;
  quality?: 'none' | 'poor' | 'reliable' | 'good' | 'excellent';
  assets?: IAssets;
  dashboard?: boolean;
}) => {
  const queryClient = new QueryClient();
  const [, setPreview] = usePreview();
  const [, setLive] = useLive();
  const [, setNetwork] = useNetwork();
  const [, setQuality] = useQuality();
  const [, setAssets] = useAssets();
  const [, setSendSocketToServer] = useSendSocketToServer();

  useEffect(() => {
    setPreview(preview);
    setSendSocketToServer({ fn: sendSocketToServer });

    const interval = setInterval(async () => {
      await postData();
    }, 3000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    setAssets(assets);
  }, [assets]);

  useEffect(() => {
    setLive(live);
  }, [live]);

  useEffect(() => {
    setNetwork(network);
    setQuality(quality);
  }, [network, quality]);

  return (
    <Wrapper className="screens-controller">
      <link rel="stylesheet" href="/assets/fonts/index.css" />
      <GlobalStyle />
      <QueryClientProvider client={queryClient}>
        <Slideshow {...props} />
      </QueryClientProvider>
    </Wrapper>
  );
};

export default ScreensController;

