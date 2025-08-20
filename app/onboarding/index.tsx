import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Building2, User, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { router } from 'expo-router';
import { BlurView } from 'expo-blur';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Personal growth themed images from Pexels
const CAROUSEL_IMAGES = [
  {
    id: 1,
    url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Personal Growth',
    subtitle: 'Unlock your potential'
  },
  {
    id: 2,
    url: 'https://images.pexels.com/photos/1181533/pexels-photo-1181533.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Mindful Learning',
    subtitle: 'Develop with intention'
  },
  {
    id: 3,
    url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Professional Excellence',
    subtitle: 'Elevate your career'
  },
  {
    id: 4,
    url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Wellness Journey',
    subtitle: 'Balance mind and body'
  },
  {
    id: 5,
    url: 'https://images.pexels.com/photos/3184639/pexels-photo-3184639.jpeg?auto=compress&cs=tinysrgb&w=800',
    title: 'Continuous Improvement',
    subtitle: 'Never stop growing'
  }
];

export default function OnboardingStart() {
  const [selectedAccountType, setSelectedAccountType] = useState<'business' | 'consumer' | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoPlayRef = useRef<NodeJS.Timeout>();

  // Auto-play carousel
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentImageIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % CAROUSEL_IMAGES.length;
          scrollViewRef.current?.scrollTo({
            x: nextIndex * screenWidth,
            animated: true
          });
          return nextIndex;
        });
      }, 4000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying]);

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / screenWidth);
    setCurrentImageIndex(index);
  };

  const navigateToImage = (index: number) => {
    setCurrentImageIndex(index);
    scrollViewRef.current?.scrollTo({
      x: index * screenWidth,
      animated: true
    });
  };

  const handleContinue = () => {
    if (selectedAccountType === 'business') {
      router.push('/onboarding/business-auth');
    } else if (selectedAccountType === 'consumer') {
      router.push('/onboarding/consumer-auth');
    }
  };

  const pauseAutoPlay = () => setIsAutoPlaying(false);
  const resumeAutoPlay = () => setIsAutoPlaying(true);

  return (
    <View style={styles.container}>
      {/* Full-screen Hero Image Carousel */}
      <View style={styles.heroContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onTouchStart={pauseAutoPlay}
          onTouchEnd={resumeAutoPlay}
          style={styles.carousel}
        >
          {CAROUSEL_IMAGES.map((image, index) => (
            <View key={image.id} style={styles.imageContainer}>
              <Image
                source={{ uri: image.url }}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <View style={styles.imageGradient} />
            </View>
          ))}
        </ScrollView>

        {/* Carousel Navigation */}
        <View style={styles.carouselNavigation}>
          <TouchableOpacity
            style={[styles.navButton, currentImageIndex === 0 && styles.navButtonDisabled]}
            onPress={() => navigateToImage(Math.max(0, currentImageIndex - 1))}
            disabled={currentImageIndex === 0}
          >
            <ChevronLeft 
              size={20} 
              color={currentImageIndex === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)'} 
            />
          </TouchableOpacity>

          <View style={styles.dotsContainer}>
            {CAROUSEL_IMAGES.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dot,
                  currentImageIndex === index && styles.activeDot
                ]}
                onPress={() => navigateToImage(index)}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.navButton, currentImageIndex === CAROUSEL_IMAGES.length - 1 && styles.navButtonDisabled]}
            onPress={() => navigateToImage(Math.min(CAROUSEL_IMAGES.length - 1, currentImageIndex + 1))}
            disabled={currentImageIndex === CAROUSEL_IMAGES.length - 1}
          >
            <ChevronRight 
              size={20} 
              color={currentImageIndex === CAROUSEL_IMAGES.length - 1 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.8)'} 
            />
          </TouchableOpacity>
        </View>

        {/* Overlaid Content */}
        <View style={styles.overlayContent}>
          {/* Brand Section */}
          <View style={styles.brandSection}>
            <Text style={styles.logo}>Skllable</Text>
            <Text style={styles.tagline}>Transform Your Potential</Text>
            <Text style={styles.description}>
              Develop essential soft skills through personalized learning experiences designed for your growth journey.
            </Text>
          </View>

          {/* Account Type Selection */}
          <View style={styles.accountTypes}>
            <TouchableOpacity
              style={[
                styles.accountTypeButton,
                selectedAccountType === 'business' && styles.accountTypeButtonSelected
              ]}
              onPress={() => setSelectedAccountType('business')}
              activeOpacity={0.8}
            >
              <BlurView intensity={20} style={styles.buttonBlur}>
                <View style={styles.buttonContent}>
                  <Building2 size={20} color="#ffffff" />
                  <Text style={styles.buttonTitle}>Business</Text>
                </View>
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.accountTypeButton,
                selectedAccountType === 'consumer' && styles.accountTypeButtonSelected
              ]}
              onPress={() => setSelectedAccountType('consumer')}
              activeOpacity={0.8}
            >
              <BlurView intensity={20} style={styles.buttonBlur}>
                <View style={styles.buttonContent}>
                  <User size={20} color="#ffffff" />
                  <Text style={styles.buttonTitle}>Personal</Text>
                </View>
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Get Started Button */}
          <TouchableOpacity
            style={[
              styles.getStartedButton,
              !selectedAccountType && styles.getStartedButtonDisabled
            ]}
            onPress={handleContinue}
            disabled={!selectedAccountType}
            activeOpacity={0.8}
          >
            <BlurView intensity={selectedAccountType ? 40 : 20} style={styles.getStartedBlur}>
              <View style={styles.getStartedContent}>
                <Text style={[
                  styles.getStartedText,
                  !selectedAccountType && styles.getStartedTextDisabled
                ]}>
                  Get Started
                </Text>
                <ArrowRight 
                  size={20} 
                  color={!selectedAccountType ? 'rgba(255,255,255,0.4)' : '#ffffff'} 
                />
              </View>
            </BlurView>
          </TouchableOpacity>

          {/* Trust Indicators */}
          <View style={styles.trustIndicators}>
            <Text style={styles.trustText}>
              Trusted by 10,000+ professionals
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  heroContainer: {
    flex: 1,
    position: 'relative',
  },
  carousel: {
    flex: 1,
  },
  imageContainer: {
    width: screenWidth,
    height: screenHeight,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  carouselNavigation: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  activeDot: {
    backgroundColor: '#ffffff',
    width: 24,
  },
  overlayContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 50,
    paddingTop: 40,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 42,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    opacity: 0.9,
  },
  description: {
    fontSize: 17,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.8,
    maxWidth: 320,
    fontWeight: '400',
  },
  accountTypes: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  accountTypeButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  accountTypeButtonSelected: {
    borderColor: 'rgba(255,255,255,0.6)',
    transform: [{ scale: 1.02 }],
  },
  buttonBlur: {
    padding: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  getStartedButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  getStartedButtonDisabled: {
    borderColor: 'rgba(255,255,255,0.1)',
  },
  getStartedBlur: {
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  getStartedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  getStartedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  getStartedTextDisabled: {
    color: 'rgba(255,255,255,0.4)',
  },
  trustIndicators: {
    alignItems: 'center',
  },
  trustText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    fontWeight: '500',
  },
});