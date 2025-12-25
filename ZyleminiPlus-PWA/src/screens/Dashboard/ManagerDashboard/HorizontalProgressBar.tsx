import React, {useRef, useState, useMemo, useCallback} from 'react';
import {Box, Typography} from '@mui/material';

// Interfaces
interface DataItem {
  name: string;
  [key: string]: string | number;
}

interface ChartConfig {
  primaryKey: string;
  secondaryKey: string;
  primaryLabel: string;
  secondaryLabel: string;
  primaryColor: string;
  secondaryColor: string;
  title: string;
  formatValue?: (value: number) => string;
}

interface VerticalProgressChartProps {
  data: DataItem[];
  config: ChartConfig;
  style?: React.CSSProperties;
}

// Helpers
const defaultFormatter = (value: number): string => {
  if (value >= 1000000) {
    return `₹${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value}`;
};

const getTextWidth = (text: string, fontSize: number = 12): number => {
  return text.length * (fontSize * 0.6);
};

const wrapText = (text: string, maxWidth: number): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (getTextWidth(testLine) <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        lines.push(
          word.substring(0, Math.floor(maxWidth / (12 * 0.6))) + '...',
        );
        break;
      }
    }

    if (lines.length >= 2) {
      if (currentLine) {
        lines[1] =
          lines[1].substring(0, Math.floor(maxWidth / (12 * 0.6))) + '...';
      }
      break;
    }
  }

  if (currentLine && lines.length < 2) {
    lines.push(currentLine);
  }

  return lines;
};

const HorizontalProgressBar: React.FC<VerticalProgressChartProps> = ({
  data,
  config,
  style,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const CONTAINER_PADDING = 20;
  const MIN_VALUE_WIDTH = 100;
  const MIN_NAME_WIDTH = 80;
  const PAGINATION_WIDTH = 30;
  const PROGRESS_BAR_MIN_WIDTH = 100;
  const BARS_PER_PAGE = 4;
  const CARD_HEIGHT = 300;
  const BAR_HEIGHT = 20;

  const formatValue = config.formatValue || defaultFormatter;

  // Responsive calculations using useMemo
  const {
    CARD_WIDTH,
    CHART_PADDING,
    CHART_WIDTH,
    CHART_HEIGHT,
    GROUP_HEIGHT,
    maxNameWidth,
  } = useMemo(() => {
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 300;
    const cardWidth = screenWidth - CONTAINER_PADDING * 2;
    const availableWidth = cardWidth - PAGINATION_WIDTH;
    const leftPadding = Math.min(MIN_NAME_WIDTH + 20, availableWidth * 0.25);
    const rightPadding = Math.min(MIN_VALUE_WIDTH + 20, availableWidth * 0.3);

    const padding = {
      left: leftPadding,
      right: rightPadding,
      top: 20,
      bottom: 30,
    };

    const chartWidth =
      cardWidth - padding.left - padding.right - PAGINATION_WIDTH;
    const chartHeight = CARD_HEIGHT - padding.top - padding.bottom;
    const groupHeight = chartHeight / BARS_PER_PAGE;
    const nameWidth = padding.left - 20;

    return {
      CARD_WIDTH: cardWidth,
      CHART_PADDING: padding,
      CHART_WIDTH: chartWidth,
      CHART_HEIGHT: chartHeight,
      GROUP_HEIGHT: groupHeight,
      maxNameWidth: nameWidth,
    };
  }, []);

  // Memoized calculations for data
  const {pages, roundedMaxValue, totalPrimary, totalSecondary} = useMemo(() => {
    const pagesCount = Math.ceil(data.length / BARS_PER_PAGE);
    const maxValue = Math.max(
      ...data.map(item =>
        Math.max(
          Number(item[config.primaryKey]),
          Number(item[config.secondaryKey]),
        ),
      ),
    );
    const rounded =
      Math.ceil(maxValue / Math.pow(10, Math.floor(Math.log10(maxValue)))) *
      Math.pow(10, Math.floor(Math.log10(maxValue)));

    const primarySum = data.reduce(
      (sum, item) => sum + Number(item[config.primaryKey]),
      0,
    );
    const secondarySum = data.reduce(
      (sum, item) => sum + Number(item[config.secondaryKey]),
      0,
    );

    return {
      pages: pagesCount,
      roundedMaxValue: rounded,
      totalPrimary: primarySum,
      totalSecondary: secondarySum,
    };
  }, [data, config]);

  // Event handlers
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const offsetY = event.currentTarget.scrollTop;
      const newIndex = Math.round(offsetY / CARD_HEIGHT);
      setActiveIndex(newIndex);
    },
    [],
  );

  const onDotPress = useCallback((index: number) => {
    scrollContainerRef.current?.scrollTo({
      top: index * CARD_HEIGHT,
      behavior: 'smooth',
    });
  }, []);

  // Render functions
  const renderBar = useCallback(
    (item: DataItem, index: number) => {
      const yPosition =
        CHART_PADDING.top +
        index * GROUP_HEIGHT +
        (GROUP_HEIGHT - BAR_HEIGHT) / 2;
      const primaryValue = Number(item[config.primaryKey]);
      const secondaryValue = Number(item[config.secondaryKey]);
      const progress = Math.min(secondaryValue / primaryValue, 1);

      const barWidth = Math.max(
        PROGRESS_BAR_MIN_WIDTH,
        Math.min(CHART_WIDTH, (primaryValue / roundedMaxValue) * CHART_WIDTH),
      );
      const progressWidth = barWidth * progress;

      const wrappedText = wrapText(item.name, maxNameWidth);
      const textYOffset = wrappedText.length > 1 ? -10 : 0;

      return (
        <g key={index}>
          {wrappedText.map((line, lineIndex) => (
            <text
              key={lineIndex}
              x={CHART_PADDING.left - 10}
              y={yPosition + BAR_HEIGHT / 2 + lineIndex * 14 + textYOffset}
              fontSize={12}
              fill="#666"
              textAnchor="end"
              alignmentBaseline="middle">
              {line}
            </text>
          ))}

          <rect
            x={CHART_PADDING.left}
            y={yPosition}
            width={barWidth}
            height={BAR_HEIGHT}
            fill={config.primaryColor}
            rx={4}
          />

          <rect
            x={CHART_PADDING.left}
            y={yPosition}
            width={progressWidth}
            height={BAR_HEIGHT}
            fill={config.secondaryColor}
            rx={4}
          />

          <text
            x={CHART_PADDING.left + barWidth + 10}
            y={yPosition + BAR_HEIGHT / 2}
            fontSize={10}
            fill="#666"
            alignmentBaseline="middle">
            {`${formatValue(secondaryValue)}/${formatValue(primaryValue)}`}
          </text>

          <text
            x={CHART_PADDING.left + barWidth + 10}
            y={yPosition + BAR_HEIGHT / 2 + 14}
            fontSize={10}
            fill="#666"
            alignmentBaseline="middle">
            {`${(progress * 100).toFixed(1)}%`}
          </text>
        </g>
      );
    },
    [
      CHART_PADDING,
      GROUP_HEIGHT,
      CHART_WIDTH,
      maxNameWidth,
      roundedMaxValue,
      config,
      formatValue,
    ],
  );

  const renderBars = useCallback(
    (startIndex: number) => {
      const pageData = data.slice(startIndex, startIndex + BARS_PER_PAGE);

      return (
        <svg width={CARD_WIDTH} height={CARD_HEIGHT}>
          <line
            x1={CHART_PADDING.left}
            y1={CHART_PADDING.top}
            x2={CHART_PADDING.left}
            y2={CARD_HEIGHT - CHART_PADDING.bottom}
            stroke="#666"
            strokeWidth="1"
          />
          <g>{pageData.map((item, index) => renderBar(item, index))}</g>
        </svg>
      );
    },
    [data, renderBar, CARD_WIDTH, CHART_PADDING],
  );

  return (
    <Box sx={{
      bgcolor: 'white',
      borderRadius: '16px',
      p: `${CONTAINER_PADDING}px`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      mt: 2.5,
      width: '100%',
      ...style,
    }}>
      <Typography sx={{
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        mb: 2.5,
        color: '#333',
      }}>
        {config.title}
      </Typography>

      <Box sx={{display: 'flex', height: `${CARD_HEIGHT}px`}}>
        <Box
          ref={scrollContainerRef}
          onScroll={handleScroll}
          sx={{
            flex: 1,
            overflowY: 'auto',
            scrollSnapType: 'y mandatory',
            '&::-webkit-scrollbar': {display: 'none'},
            scrollbarWidth: 'none',
          }}>
          {Array.from({length: pages}).map((_, pageIndex) => (
            <Box
              key={pageIndex}
              sx={{
                height: `${CARD_HEIGHT}px`,
                scrollSnapAlign: 'start',
              }}>
              {renderBars(pageIndex * BARS_PER_PAGE)}
            </Box>
          ))}
        </Box>

        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: `${PAGINATION_WIDTH}px`,
        }}>
          {Array.from({length: pages}).map((_, index) => (
            <Box
              key={index}
              onClick={() => onDotPress(index)}
              sx={{
                p: 0.625,
                cursor: 'pointer',
              }}>
              <Box
                sx={{
                  width: index === activeIndex ? 14 : 10,
                  height: index === activeIndex ? 14 : 10,
                  borderRadius: index === activeIndex ? '7px' : '5px',
                  bgcolor: index === activeIndex ? config.primaryColor : '#ddd',
                  my: 0.5,
                  transition: 'all 0.3s',
                }}
              />
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        mt: 2,
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mx: 2.5,
        }}>
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            <Box sx={{
              width: 16,
              height: 16,
              mr: 0.625,
              borderRadius: '4px',
              bgcolor: config.primaryColor,
            }} />
            <Typography sx={{
              fontSize: 12,
              color: '#666',
              fontFamily: 'Proxima Nova',
            }}>
              {config.primaryLabel}
            </Typography>
          </Box>
          <Typography sx={{
            fontSize: 12,
            color: '#333',
            mt: 0.5,
            fontWeight: '700',
            fontFamily: 'Proxima Nova',
          }}>
            {`Total: ${formatValue(totalPrimary)}`}
          </Typography>
        </Box>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mx: 2.5,
        }}>
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            <Box sx={{
              width: 16,
              height: 16,
              mr: 0.625,
              borderRadius: '4px',
              bgcolor: config.secondaryColor,
            }} />
            <Typography sx={{
              fontSize: 12,
              color: '#666',
              fontFamily: 'Proxima Nova',
            }}>
              {config.secondaryLabel}
            </Typography>
          </Box>
          <Typography sx={{
            fontSize: 12,
            color: '#333',
            mt: 0.5,
            fontWeight: '700',
            fontFamily: 'Proxima Nova',
          }}>
            {`Total: ${formatValue(totalSecondary)}`}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default HorizontalProgressBar;

