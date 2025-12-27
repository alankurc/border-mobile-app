import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Linking } from 'react-native';
import ContactView from '../components/ContactView';

// Mock Mocks for Icons and Fonts
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));
jest.mock('expo-font', () => ({
    useFonts: () => [true],
}));

describe('<ContactView />', () => {
    beforeAll(() => {
        jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    });

    test('renders all contact buttons', () => {
        const { getByText } = render(<ContactView />);

        expect(getByText('Instagram')).toBeTruthy();
        expect(getByText('WhatsApp')).toBeTruthy();
        expect(getByText('Facebook')).toBeTruthy();
        expect(getByText('Conocé nuestra web')).toBeTruthy();
        expect(getByText('Invitanos un cafecito')).toBeTruthy();
    });

    test('opens Instagram link when pressed', () => {
        const { getByText } = render(<ContactView />);
        const button = getByText('Instagram');

        fireEvent.press(button);
        expect(Linking.openURL).toHaveBeenCalledWith('https://www.instagram.com/radioborderretromusic/');
    });

    test('opens WhatsApp link when pressed', () => {
        const { getByText } = render(<ContactView />);
        const button = getByText('WhatsApp');

        fireEvent.press(button);
        expect(Linking.openURL).toHaveBeenCalledWith(expect.stringContaining('https://wa.me/'));
    });
});
