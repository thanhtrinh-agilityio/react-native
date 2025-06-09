import { ThemeProvider } from '@rneui/themed';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import * as Clipboard from 'react-native';
import { Alert } from 'react-native';
import { MarkdownRenderer } from '../index';

jest.spyOn(Alert, 'alert');
jest.spyOn(Clipboard, 'Clipboard', 'get').mockReturnValue({
  setString: jest.fn(),
});

const customRender = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('MarkdownRenderer', () => {
  it('renders heading correctly', () => {
    const { getByText } = customRender(
      <MarkdownRenderer content={'## Heading Test'} />,
    );

    expect(getByText('Heading Test')).toBeTruthy();
  });

  it('renders heading3 and heading4 normally', () => {
    const markdown = `
      ### Regular Heading 3
      #### Regular Heading 4
      `;

    const { getByText } = render(<MarkdownRenderer content={markdown} />);

    expect(getByText('Regular Heading 3')).toBeTruthy();
    expect(getByText('Regular Heading 4')).toBeTruthy();
  });

  it('does not render heading3 when it contains code metadata', () => {
    const markdown = `
        ### javascript (example.js)

        \`\`\`javascript
        const a = 1;
        \`\`\`
        `;

    const { queryByText } = render(<MarkdownRenderer content={markdown} />);

    // Should NOT find the heading text because it's parsed as code metadata
    expect(queryByText('javascript (example.js)')).toBeNull();

    // But the language and filename should show in code block UI
    expect(queryByText(/JAVASCRIPT/i)).toBeTruthy();
    expect(queryByText(/example\.js/i)).toBeTruthy();
  });

  it('renders inline code', () => {
    const { queryByText } = customRender(
      <MarkdownRenderer content={'Inline `javascript` test'} />,
    );

    expect(queryByText(/JAVASCRIPT/i)).toBeTruthy();
  });

  it('renders code block with language and filename', async () => {
    const markdown = `## javascript (example.js)\n\`\`\`javascript\nconst a = 1;\n\`\`\``;
    const { getByText } = customRender(<MarkdownRenderer content={markdown} />);

    await waitFor(() => {
      expect(getByText(/javascript/i)).toBeTruthy();
      expect(getByText(/example\.js/i)).toBeTruthy();
      expect(getByText('Copy')).toBeTruthy();
    });
  });

  it('copies code block to clipboard when "Copy" is pressed', async () => {
    const markdown = `## javascript (example.js)\n\`\`\`javascript\nconsole.log('hello');\n\`\`\``;
    const { getByText } = customRender(<MarkdownRenderer content={markdown} />);

    const copyButton = getByText('Copy');
    fireEvent.press(copyButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Copied!');
    });
  });
});
