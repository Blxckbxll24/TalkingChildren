import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import BottomNavBar from '../components/Navbar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface StatItem {
    id: string;
    title: string;
    value: string | number;
    bgColorLight: string;
    bgColorDark: string;
    textStyle?: object;
    isItalic?: boolean;
}

const statsData: StatItem[] = [
    { id: '1', title: 'Frases Dichas', value: 37, bgColorLight: 'bg-blue-100', bgColorDark: 'bg-blue-800' },
    { id: '2', title: 'Frase más usada', value: '"Quiero ir al baño"', bgColorLight: 'bg-green-100', bgColorDark: 'bg-green-800', textStyle: { fontSize: 18, fontWeight: '500' }, isItalic: true },
    { id: '3', title: 'Frases Utilizables', value: 10, bgColorLight: 'bg-purple-100', bgColorDark: 'bg-purple-800' },
    { id: '4', title: 'Palabras Dichas', value: 37, bgColorLight: 'bg-yellow-100', bgColorDark: 'bg-yellow-800' },
];

const historyData = [
    'Papá tengo hambre',
    'Quiero ir al baño',
    'Vamos a jugar',
    'Tengo sed',
    'Quiero ir al baño',
];

const DashboardScreen = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const insets = useSafeAreaInsets();

    const renderStatItem = ({ item }: { item: StatItem }) => (
        <View
            className={`rounded-xl p-4 shadow m-2 flex-1 ${isDark ? item.bgColorDark : item.bgColorLight}`}
            style={{ minWidth: 140, maxWidth: 160 }}
        >
            <Text
                className={`${isDark ? 'text-white' : 'text-black'} text-lg font-bold`}
                style={item.isItalic ? { fontStyle: 'italic', ...item.textStyle } : item.textStyle}
            >
                {item.value}
            </Text>
            <Text className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mt-1`}>
                {item.title}
            </Text>
        </View>
    );

    return (
        <View
            className={`flex-1 relative ${isDark ? 'bg-gray-900' : 'bg-white'}`}
            style={{ paddingTop: insets.top }}
        >
            <View className='p-6 flex-1 mt-4'>
                <Text className={`text-3xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-black'}`}>
                    Dashboard
                </Text>

                <FlatList
                    data={statsData}
                    renderItem={renderStatItem}
                    keyExtractor={(item) => item.id}
                    horizontal={false}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    scrollEnabled={false}
                    contentContainerStyle={{ marginBottom: 20 }}
                />

                <View
                    className={`rounded-2xl p-6 shadow ${isDark ? 'bg-gray-800' : 'bg-gray-100'} mb-24`}
                >
                    <Text className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                        Historial
                    </Text>
                    {historyData.map((item, index) => (
                        <Text
                            key={index}
                            className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2 text-sm`}
                        >
                            {index + 1}. {item}
                        </Text>
                    ))}
                </View>
            </View>


                <BottomNavBar theme={theme} />
        </View>
    );
};

export default DashboardScreen;
