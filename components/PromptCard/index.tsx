import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

// components
import { BaseButton, TextBlock } from '@/components';
import { Card, FullTheme, Icon, useTheme } from '@rneui/themed';

type PromptCardProps = {
  title: string;
  description: string;
  iconName?: string;
  iconType?: string;
  colorCard?: string;
  onGetAnswer?: () => void;
  onEditPrompt?: () => void;
};

const makeStyles = (theme: FullTheme) =>
  StyleSheet.create({
    containerCard: {
      borderRadius: 16,
      padding: 20,
      borderWidth: 0.5,
      backgroundColor: theme?.colors.background,
    },
    containerIcon: {
      width: 40,
      height: 40,
      borderRadius: 100,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    containerButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 4,
      marginTop: 16,
    },
  });

const PromptCardItem = ({
  title,
  description,
  iconName = 'data-object',
  iconType = 'material',
  colorCard,
  onGetAnswer,
  onEditPrompt,
}: PromptCardProps) => {
  const { theme } = useTheme();
  const fullTheme = theme as FullTheme;
  const styles = makeStyles(fullTheme);

  return (
    <Card containerStyle={styles.containerCard}>
      {/* Icon */}
      <View
        style={{
          backgroundColor: colorCard,
          ...styles.containerIcon,
        }}
      >
        <Icon name={iconName} type={iconType} color="#fff" size={20} />
      </View>
      <TextBlock type="defaultSemiBold">{title}</TextBlock>
      <TextBlock>{description}</TextBlock>
      <View style={styles.containerButton}>
        <BaseButton
          title="Get Answer"
          accessibilityLabel="Get Answer"
          containerStyle={{ width: 104 }}
          buttonStyle={{ backgroundColor: colorCard, height: 32 }}
          onPress={onGetAnswer}
          size="sm"
        />
        <BaseButton
          title="Edit Prompt"
          type="outline"
          accessibilityLabel="Edit Prompt"
          containerStyle={{ width: 104 }}
          buttonStyle={{ height: 32 }}
          titleColorOutline={colorCard}
          onPress={onEditPrompt}
          size="sm"
        />
      </View>
    </Card>
  );
};

export const PromptCard = memo(PromptCardItem);
