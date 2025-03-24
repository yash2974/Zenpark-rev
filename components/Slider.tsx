import React from 'react';
import { View, Text, StyleSheet, Dimensions, Button } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationProp, useNavigation } from '@react-navigation/native';  // Correct import


const { width } = Dimensions.get('window');

const slides = [
    {
        key: '1',
        title: 'Welcome to Zenpark',
        description: 'Find and book parking spots easily with our app.',
    },
    {
        key: '2',
        title: 'Save Time and Money',
        description: 'Get the best deals on parking spaces near you.',
    },
    {
        key: '3',
        title: 'Park with Confidence',
        description: 'Enjoy secure and hassle-free parking experiences.',
    },
];

const Slider: React.FC = () => {
    const navigation = useNavigation<NavigationProp<{ loginScreen: undefined }>>();  // Add navigation hook with type

    return (
        <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.container}
        >
            {slides.map((slide) => (
                <View key={slide.key} style={styles.slide}>
                    <Text style={styles.title}>{slide.title}</Text>
                    <Text style={styles.description}>{slide.description}</Text>

                    {/* Render button only on the last slide */}
                    {slide.key === '3' && (
                        <Button
                            title="Get Started"
                            onPress={() => navigation.navigate('loginScreen')}  // Navigate to Login
                        />
                    )}
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    slide: {
        width,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        color: '#666',
        marginBottom: 20,
    },
});

export default Slider;
