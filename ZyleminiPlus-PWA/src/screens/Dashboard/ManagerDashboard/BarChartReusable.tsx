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

interface ScrollableBarChartProps {
  data: DataItem[];
  config: ChartConfig;
  style?: React.CSSProperties;
}

// Default formatter
const defaultFormatter = (value: number): string => {
  if (value >= 1000000) {
    return `₹${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }
  return `₹${value}`;
};

const wrapText = (text: string, maxCharsPerLine: number = 12): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxCharsPerLine) {
      currentLine += (currentLine.length === 0 ? '' : ' ') + word;
    } else {
      if (currentLine.length > 0) {
        lines.push(currentLine);
      }
      currentLine =
        word.length > maxCharsPerLine
          ? word.slice(0, maxCharsPerLine - 2) + '..'
          : word;
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine);
  }

  if (lines.length > 2) {
    lines.length = 2;
    lines[1] = lines[1].slice(0, maxCharsPerLine - 2) + '..';
  }

  return lines;
};

const BarChartReusable: React.FC<ScrollableBarChartProps> = ({
  data,
  config,
  style,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const CONTAINER_PADDING = 20;
  const CARD_WIDTH = typeof window !== 'undefined' ? window.innerWidth - CONTAINER_PADDING * 2 : 300;
  const CARD_HEIGHT = 250;
  const CARDS_PER_PAGE = 3;
  const CHART_PADDING = {left: 45, right: 20, top: 20, bottom: 40};
  const CHART_WIDTH = CARD_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
  const CHART_HEIGHT = CARD_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;

  const formatValue = config.formatValue || defaultFormatter;

  const {pages, roundedMaxValue, barWidth, totalPrimary, totalSecondary} =
    useMemo(() => {
      const pagesCount = Math.ceil(data.length / CARDS_PER_PAGE);
      const max = Math.max(
        ...data.map(item =>
          Math.max(
            Number(item[config.primaryKey]),
            Number(item[config.secondaryKey]),
          ),
        ),
      );
      const rounded =
        Math.ceil(max / Math.pow(10, Math.floor(Math.log10(max)))) *
        Math.pow(10, Math.floor(Math.log10(max)));
      const bWidth = CHART_WIDTH / CARDS_PER_PAGE / 3;
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
        barWidth: bWidth,
        totalPrimary: primarySum,
        totalSecondary: secondarySum,
      };
    }, [data, config]);

  const getYPosition = useCallback(
    (value: number): number => {
      return (
        CHART_PADDING.top +
        CHART_HEIGHT -
        (value / roundedMaxValue) * CHART_HEIGHT
      );
    },
    [roundedMaxValue, CHART_PADDING, CHART_HEIGHT],
  );

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const offsetX = event.currentTarget.scrollLeft;
      const newIndex = Math.round(offsetX / CARD_WIDTH);
      setActiveIndex(newIndex);
    },
    [CARD_WIDTH],
  );

  const onDotPress = useCallback((index: number) => {
    scrollContainerRef.current?.scrollTo({
      left: index * CARD_WIDTH,
      behavior: 'smooth',
    });
  }, [CARD_WIDTH]);

  const renderAxes = useCallback(() => {
    const yAxisValues = [0, roundedMaxValue / 2, roundedMaxValue];
    return (
      <>
        <line
          x1={CHART_PADDING.left}
          y1={CHART_PADDING.top}
          x2={CHART_PADDING.left}
          y2={CARD_HEIGHT - CHART_PADDING.bottom}
          stroke="#666"
          strokeWidth="1"
        />
        <line
          x1={CHART_PADDING.left}
          y1={CARD_HEIGHT - CHART_PADDING.bottom}
          x2={CARD_WIDTH - CHART_PADDING.right}
          y2={CARD_HEIGHT - CHART_PADDING.bottom}
          stroke="#666"
          strokeWidth="1"
        />
        {yAxisValues.map((value, index) => (
          <text
            key={index}
            x={CHART_PADDING.left - 10}
            y={getYPosition(value) + 5}
            fontSize={10}
            fill="#666"
            textAnchor="end">
            {formatValue(value)}
          </text>
        ))}
      </>
    );
  }, [roundedMaxValue, getYPosition, formatValue, CHART_PADDING, CARD_HEIGHT, CARD_WIDTH]);

  const renderBars = useCallback(
    (startIndex: number) => {
      const pageData = data.slice(startIndex, startIndex + CARDS_PER_PAGE);
      const barSpacing = CHART_WIDTH / CARDS_PER_PAGE;

      return (
        <svg width={CARD_WIDTH} height={CARD_HEIGHT}>
          {renderAxes()}
          <g>
            {pageData.map((item, index) => {
              const xPosition =
                CHART_PADDING.left +
                index * barSpacing +
                (barSpacing - barWidth * 2) / 3;
              const primaryValue = Number(item[config.primaryKey]);
              const secondaryValue = Number(item[config.secondaryKey]);
              const primaryHeight =
                (primaryValue / roundedMaxValue) * CHART_HEIGHT;
              const secondaryHeight =
                (secondaryValue / roundedMaxValue) * CHART_HEIGHT;

              const nameLines = wrapText(item.name);

              return (
                <g key={index}>
                  <rect
                    x={xPosition}
                    y={getYPosition(primaryValue)}
                    width={barWidth}
                    height={primaryHeight}
                    fill={config.primaryColor}
                    rx={5}
                  />
                  <rect
                    x={xPosition + barWidth + 2}
                    y={getYPosition(secondaryValue)}
                    width={barWidth}
                    height={secondaryHeight}
                    fill={config.secondaryColor}
                    rx={5}
                  />
                  <text
                    x={xPosition + barWidth / 2}
                    y={getYPosition(primaryValue) - 5}
                    fontSize={9}
                    fill="#666"
                    textAnchor="middle">
                    {formatValue(primaryValue)}
                  </text>
                  <text
                    x={xPosition + barWidth * 1.5 + 2}
                    y={getYPosition(secondaryValue) - 5}
                    fontSize={9}
                    fill="#666"
                    textAnchor="middle">
                    {formatValue(secondaryValue)}
                  </text>
                  <text
                    x={xPosition + barWidth}
                    y={CARD_HEIGHT - CHART_PADDING.bottom + 15}
                    fontSize={10}
                    fill="#333"
                    textAnchor="middle">
                    {nameLines.map((line, lineIndex) => (
                      <tspan
                        key={lineIndex}
                        x={xPosition + barWidth}
                        dy={lineIndex === 0 ? 0 : 12}>
                        {line}
                      </tspan>
                    ))}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      );
    },
    [
      data,
      barWidth,
      roundedMaxValue,
      getYPosition,
      renderAxes,
      config,
      formatValue,
      CHART_WIDTH,
      CARD_WIDTH,
      CARD_HEIGHT,
      CHART_PADDING,
      CHART_HEIGHT,
    ],
  );

  return (
    <Box sx={{
      bgcolor: 'white',
      borderRadius: '16px',
      p: `${CONTAINER_PADDING}px`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      mt: 2.5,
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

      <Box
        ref={scrollContainerRef}
        onScroll={handleScroll}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          '&::-webkit-scrollbar': {display: 'none'},
          scrollbarWidth: 'none',
        }}>
        {Array.from({length: pages}).map((_, pageIndex) => (
          <Box
            key={pageIndex}
            sx={{
              minWidth: `${CARD_WIDTH}px`,
              height: `${CARD_HEIGHT}px`,
              scrollSnapAlign: 'start',
            }}>
            {renderBars(pageIndex * CARDS_PER_PAGE)}
          </Box>
        ))}
      </Box>

      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mt: 1,
      }}>
        {Array.from({length: pages}).map((_, index) => (
          <Box
            key={index}
            onClick={() => onDotPress(index)}
            sx={{
              px: 0.25,
              cursor: 'pointer',
            }}>
            <Box
              sx={{
                width: index === activeIndex ? 14 : 10,
                height: index === activeIndex ? 14 : 10,
                borderRadius: index === activeIndex ? '7px' : '5px',
                bgcolor: index === activeIndex ? config.primaryColor : '#ddd',
                mx: 0.5,
                transition: 'all 0.3s',
              }}
            />
          </Box>
        ))}
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

export default BarChartReusable;

