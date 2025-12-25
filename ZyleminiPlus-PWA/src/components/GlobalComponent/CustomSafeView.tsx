// Web-adapted CustomSafeView component
import React from 'react';
import { Container, Box } from '@mui/material';

interface CustomSafeViewProp {
  isScrollView?: boolean;
  children?: React.ReactNode;
  header?: React.ReactNode;
  edges?: string[];
}

export default function CustomSafeView(props: CustomSafeViewProp) {
  const { isScrollView = false, children, header } = props;

  if (isScrollView) {
    return (
      <Box
        sx={{
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {header}
        {children}
      </Box>
    );
  }

  return (
    <Container
      maxWidth={false}
      sx={{
        height: '100vh',
        padding: 0,
        margin: 0,
      }}
    >
      {header}
      {children}
    </Container>
  );
}


