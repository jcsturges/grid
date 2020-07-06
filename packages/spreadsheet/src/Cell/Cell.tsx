import React, { memo } from "react";
import { RendererProps, isNull } from "@rowsncolumns/grid";
import {
  DARK_MODE_COLOR,
  DARK_MODE_COLOR_LIGHT,
  format as defaultFormat,
  luminance,
  DEFAULT_FONT_SIZE,
  castToString,
} from "../constants";
import {
  DATATYPE,
  FONT_WEIGHT,
  FONT_STYLE,
  HORIZONTAL_ALIGNMENT,
  TEXT_DECORATION,
  VERTICAL_ALIGNMENT,
  FormatType,
} from "./../types";
import { useColorMode } from "@chakra-ui/core";
import { CellConfig } from "../Spreadsheet";
import { Shape, Text } from "react-konva";

/* Array placeholder */
const EMPTY_ARRAY: number[] = [];

export interface CellProps extends RendererProps, CellConfig {
  isHidden?: boolean;
  formatter?: FormatType;
  showGridLines?: boolean;
}

export interface CellRenderProps extends Omit<CellProps, "text"> {
  text?: string;
}

/**
 * Cell renderer
 * @param props
 */
const Cell: React.FC<CellProps> = memo((props) => {
  const { colorMode } = useColorMode();
  const { datatype, decimals, percent, currency, formatter, isHidden } = props;
  const {
    stroke,
    strokeTopColor,
    strokeRightColor,
    strokeBottomColor,
    strokeLeftColor,
    strokeDash,
    strokeTopDash,
    strokeRightDash,
    strokeBottomDash,
    strokeLeftDash,
    strokeWidth,
    strokeTopWidth,
    strokeRightWidth,
    strokeBottomWidth,
    strokeLeftWidth,
    lineCap,
    format,
    currencySymbol,
    ...cellProps
  } = props;
  if (isHidden) return null;
  const text = formatter
    ? formatter(props.text, datatype, {
        decimals,
        percent,
        currency,
        format,
        currencySymbol,
      })
    : castToString(props.text);
  const isLightMode = colorMode === "light";
  return <DefaultCell isLightMode={isLightMode} {...cellProps} text={text} />;
});

/**
 * Default cell renderer
 */
const DefaultCell: React.FC<CellRenderProps> = memo((props) => {
  const {
    x = 0,
    y = 0,
    width,
    height,
    isMergedCell,
    fill: userFill,
    datatype,
    color: userColor,
    italic,
    bold,
    horizontalAlign,
    verticalAlign = VERTICAL_ALIGNMENT.BOTTOM,
    underline,
    strike,
    fontFamily,
    padding = 5,
    fontSize = DEFAULT_FONT_SIZE,
    wrap = "none",
    lineHeight = 0.5,
    isLightMode,
    text,
    showGridLines,
  } = props;
  const textDecoration = `${underline ? TEXT_DECORATION.UNDERLINE + " " : ""}${
    strike ? TEXT_DECORATION.STRIKE : ""
  }`;
  const fontWeight = bold ? FONT_WEIGHT.BOLD : FONT_WEIGHT.NORMAL;
  const fontStyle = italic ? FONT_STYLE.ITALIC : FONT_STYLE.NORMAL;
  const textStyle = `${fontWeight} ${fontStyle}`;
  const vAlign = verticalAlign;

  const hAlign =
    horizontalAlign === void 0
      ? datatype === DATATYPE.NUMBER
        ? HORIZONTAL_ALIGNMENT.RIGHT
        : HORIZONTAL_ALIGNMENT.LEFT
      : horizontalAlign;
  const defaultFill = isLightMode ? "white" : DARK_MODE_COLOR_LIGHT;
  const textColor = userColor ? userColor : isLightMode ? "#333" : "white";
  const showRect = !isNull(userFill) || isMergedCell;
  const hasFill = !isNull(userFill);
  const hasText = !isNull(text);

  return (
    <>
      {showRect ? (
        <Shape
          x={x}
          y={y}
          width={width}
          height={height}
          sceneFunc={(context, shape) => {
            context.beginPath();
            context.setAttr("fillStyle", userFill || defaultFill);
            context.fillRect(1, 1, shape.width() - 1, shape.height() - 1);
            if (hasFill) {
              context.setAttr(
                "strokeStyle",
                showGridLines ? luminance(userFill, -20) : userFill
              );
              context.strokeRect(0.5, 0.5, shape.width(), shape.height());
            }
          }}
        />
      ) : null}
      {hasText ? (
        <Text
          x={x}
          y={y}
          height={height}
          width={width}
          text={text}
          fill={textColor}
          verticalAlign={vAlign}
          align={hAlign}
          fontFamily={fontFamily}
          fontStyle={textStyle}
          textDecoration={textDecoration}
          padding={padding}
          wrap={wrap}
          fontSize={fontSize}
          lineHeight={lineHeight}
          hitStrokeWidth={0}
        />
      ) : null}
    </>
  );
});

export default Cell;
