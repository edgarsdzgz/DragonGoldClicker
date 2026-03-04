import React, { ReactNode } from 'react'
import { Text as RNText, StyleSheet, TextStyle, TextProps as RNTextProps } from 'react-native'
import { colors, typography } from '../theme'

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'button'
  | 'display'

export type TextColor = 'primary' | 'secondary' | 'muted' | 'link' | 'inverse' | 'success' | 'warning' | 'error'

interface TextProps extends Omit<RNTextProps, 'style'> {
  children: ReactNode
  variant?: TextVariant
  color?: TextColor
  bold?: boolean
  italic?: boolean
  center?: boolean
  style?: TextStyle
}

export function Text({
  children,
  variant = 'body',
  color = 'primary',
  bold = false,
  italic = false,
  center = false,
  style,
  ...props
}: TextProps) {
  const textStyle: TextStyle[] = [
    styles.base,
    styles[variant],
    styles[`color_${color}`],
  ]

  if (bold) textStyle.push(styles.bold)
  if (italic) textStyle.push(styles.italic)
  if (center) textStyle.push(styles.center)
  if (style) textStyle.push(style)

  return (
    <RNText style={textStyle} {...props}>
      {children}
    </RNText>
  )
}

const styles = StyleSheet.create({
  base: {},
  h1: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.h1.fontWeight,
    lineHeight: typography.h1.lineHeight,
  },
  h2: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight,
    lineHeight: typography.h2.lineHeight,
  },
  h3: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight,
    lineHeight: typography.h3.lineHeight,
  },
  body: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
  },
  bodySmall: {
    fontSize: typography.bodySmall.fontSize,
    fontWeight: typography.bodySmall.fontWeight,
    lineHeight: typography.bodySmall.lineHeight,
  },
  caption: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.caption.fontWeight,
    lineHeight: typography.caption.lineHeight,
  },
  label: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    lineHeight: typography.label.lineHeight,
  },
  button: {
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight,
    lineHeight: typography.button.lineHeight,
  },
  display: {
    fontSize: typography.display.fontSize,
    fontWeight: typography.display.fontWeight,
    lineHeight: typography.display.lineHeight,
  },
  color_primary: { color: colors.text.primary },
  color_secondary: { color: colors.text.secondary },
  color_muted: { color: colors.text.muted },
  color_link: { color: colors.text.link },
  color_inverse: { color: colors.text.inverse },
  color_success: { color: colors.status.success },
  color_warning: { color: colors.status.warning },
  color_error: { color: colors.status.error },
  bold: { fontWeight: 'bold' },
  italic: { fontStyle: 'italic' },
  center: { textAlign: 'center' },
})

export default Text
