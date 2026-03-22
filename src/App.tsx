import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import type { FutureConfig } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'

const WelcomeScreen = lazy(() => import('./screens/onboarding/WelcomeScreen'))
const SignUpPersonalInfo = lazy(() => import('./screens/onboarding/SignUpPersonalInfo'))
const SignUpContact = lazy(() => import('./screens/onboarding/SignUpContact'))
const VerificationScreen = lazy(() => import('./screens/onboarding/VerificationScreen'))
const ProfessionalSignUp = lazy(() => import('./screens/onboarding/ProfessionalSignUp'))
const LoginScreen = lazy(() => import('./screens/onboarding/LoginScreen'))
const PasswordRecoveryScreen = lazy(() => import('./screens/onboarding/PasswordRecoveryScreen'))
const ClientHomeFeed = lazy(() => import('./screens/client/ClientHomeFeed'))
const MessagesList = lazy(() => import('./screens/messages/MessagesList'))
const NewConversation = lazy(() => import('./screens/messages/NewConversation'))
const NewGroupConversation = lazy(() => import('./screens/messages/NewGroupConversation'))
const IndividualChat = lazy(() => import('./screens/messages/IndividualChat'))
const GroupChat = lazy(() => import('./screens/messages/GroupChat'))
const GroupInfo = lazy(() => import('./screens/messages/GroupInfo'))
const CallScreen = lazy(() => import('./screens/messages/CallScreen'))
const SocialFeed = lazy(() => import('./screens/social/SocialFeed'))
const PostDetail = lazy(() => import('./screens/social/PostDetail'))
const CreatePost = lazy(() => import('./screens/social/CreatePost'))
const CreateStory = lazy(() => import('./screens/social/CreateStory'))
const StoryViewer = lazy(() => import('./screens/social/StoryViewer'))
const UserProfile = lazy(() => import('./screens/social/UserProfile'))
const SearchUsers = lazy(() => import('./screens/social/SearchUsers'))
const FollowersList = lazy(() => import('./screens/social/FollowersList'))
const FollowingList = lazy(() => import('./screens/social/FollowingList'))
const GroupsDiscovery = lazy(() => import('./screens/social/GroupsDiscovery'))
const GroupPage = lazy(() => import('./screens/social/GroupPage'))
const ServicesSearch = lazy(() => import('./screens/services/ServicesSearch'))
const AdvancedFilters = lazy(() => import('./screens/services/AdvancedFilters'))
const SearchResults = lazy(() => import('./screens/services/SearchResults'))
const MapView = lazy(() => import('./screens/services/MapView'))
const ProfessionalProfile = lazy(() => import('./screens/services/ProfessionalProfile'))
const ServiceSelection = lazy(() => import('./screens/services/ServiceSelection'))
const ServiceDetail = lazy(() => import('./screens/services/ServiceDetail'))
const BookingCalendar = lazy(() => import('./screens/services/BookingCalendar'))
const PaymentMethod = lazy(() => import('./screens/services/PaymentMethod'))
const PaymentConfirmation = lazy(() => import('./screens/services/PaymentConfirmation'))
const MyBookingsList = lazy(() => import('./screens/bookings/MyBookingsList'))
const BookingDetail = lazy(() => import('./screens/bookings/BookingDetail'))
const ActiveBookingTracking = lazy(() => import('./screens/bookings/ActiveBookingTracking'))
const RescheduleBooking = lazy(() => import('./screens/bookings/RescheduleBooking'))
const RateReview = lazy(() => import('./screens/bookings/RateReview'))
const WalletHome = lazy(() => import('./screens/wallet/WalletHome'))
const TopUpWallet = lazy(() => import('./screens/wallet/TopUpWallet'))
const TransactionDetail = lazy(() => import('./screens/wallet/TransactionDetail'))
const ClientProfile = lazy(() => import('./screens/profile/ClientProfile'))
const EditPersonalInfo = lazy(() => import('./screens/profile/EditPersonalInfo'))
const PrivacySettings = lazy(() => import('./screens/profile/PrivacySettings'))
const NotificationsSettings = lazy(() => import('./screens/profile/NotificationsSettings'))
const Favorites = lazy(() => import('./screens/profile/Favorites'))
const StoriesArchive = lazy(() => import('./screens/profile/StoriesArchive'))
const ProfessionalDashboard = lazy(() => import('./screens/professional/ProfessionalDashboard'))
const ProfessionalProfileScreen = lazy(() => import('./screens/professional/ProfessionalProfileScreen'))
const ManageServices = lazy(() => import('./screens/professional/ManageServices'))
const CreateEditService = lazy(() => import('./screens/professional/CreateEditService'))
const CalendarManagement = lazy(() => import('./screens/professional/CalendarManagement'))
const BookingRequest = lazy(() => import('./screens/professional/BookingRequest'))
const ActiveBooking = lazy(() => import('./screens/professional/ActiveBooking'))
const FinancialDashboard = lazy(() => import('./screens/professional/FinancialDashboard'))
const WithdrawalRequest = lazy(() => import('./screens/professional/WithdrawalRequest'))
const ReviewsManagement = lazy(() => import('./screens/professional/ReviewsManagement'))
const ProfessionalSettings = lazy(() => import('./screens/professional/ProfessionalSettings'))

const routerFutureFlags: FutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

function App() {
  return (
    <Router future={routerFutureFlags}>
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#F7FAFC' }}>Chargement...</div>}>
        <Routes>
        {/* Onboarding & Auth */}
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/signup/personal" element={<SignUpPersonalInfo />} />
        <Route path="/signup/contact" element={<SignUpContact />} />
        <Route path="/signup/verification" element={<VerificationScreen />} />
        <Route path="/signup/professional" element={<ProfessionalSignUp />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/password-recovery" element={<PasswordRecoveryScreen />} />
        
        {/* Client Screens (protégé) */}
        <Route path="/client/home" element={<ProtectedRoute><ClientHomeFeed /></ProtectedRoute>} />
        
        {/* Messages (protégé, temps réel) */}
        <Route path="/messages" element={<ProtectedRoute><MessagesList /></ProtectedRoute>} />
        <Route path="/messages/new" element={<ProtectedRoute><NewConversation /></ProtectedRoute>} />
        <Route path="/messages/group/new" element={<ProtectedRoute><NewGroupConversation /></ProtectedRoute>} />
        <Route path="/messages/chat/:id" element={<ProtectedRoute><IndividualChat /></ProtectedRoute>} />
        <Route path="/messages/group/:id" element={<ProtectedRoute><GroupChat /></ProtectedRoute>} />
        <Route path="/messages/group/:id/info" element={<ProtectedRoute><GroupInfo /></ProtectedRoute>} />
        <Route path="/messages/call" element={<ProtectedRoute><CallScreen /></ProtectedRoute>} />
        
        {/* Social (protégé, publications réelles) */}
        <Route path="/social" element={<ProtectedRoute><SocialFeed /></ProtectedRoute>} />
        <Route path="/social/post/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
        <Route path="/social/create-post" element={<ProtectedRoute><CreatePost /></ProtectedRoute>} />
        <Route path="/social/create-story" element={<ProtectedRoute><CreateStory /></ProtectedRoute>} />
        <Route path="/social/story/:id" element={<ProtectedRoute><StoryViewer /></ProtectedRoute>} />
        <Route path="/social/profile/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/social/profile/:id/followers" element={<ProtectedRoute><FollowersList /></ProtectedRoute>} />
        <Route path="/social/profile/:id/following" element={<ProtectedRoute><FollowingList /></ProtectedRoute>} />
        <Route path="/social/search-users" element={<ProtectedRoute><SearchUsers /></ProtectedRoute>} />
        <Route path="/social/groups" element={<ProtectedRoute><GroupsDiscovery /></ProtectedRoute>} />
        <Route path="/social/group/:id" element={<ProtectedRoute><GroupPage /></ProtectedRoute>} />
        
        {/* Services */}
        <Route path="/services" element={<ServicesSearch />} />
        <Route path="/services/filters" element={<AdvancedFilters />} />
        <Route path="/services/results" element={<SearchResults />} />
        <Route path="/services/map" element={<MapView />} />
        <Route path="/services/professional/:id" element={<ProfessionalProfile />} />
        <Route path="/services/detail/:id" element={<ServiceDetail />} />
        <Route path="/services/select" element={<ServiceSelection />} />
        <Route path="/services/booking" element={<BookingCalendar />} />
        <Route path="/services/payment" element={<PaymentMethod />} />
        <Route path="/services/payment/confirmation" element={<PaymentConfirmation />} />
        
        {/* Bookings (protégé) */}
        <Route path="/bookings" element={<ProtectedRoute><MyBookingsList /></ProtectedRoute>} />
        <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetail /></ProtectedRoute>} />
        <Route path="/bookings/:id/tracking" element={<ProtectedRoute><ActiveBookingTracking /></ProtectedRoute>} />
        <Route path="/bookings/:id/reschedule" element={<ProtectedRoute><RescheduleBooking /></ProtectedRoute>} />
        <Route path="/bookings/:id/review" element={<ProtectedRoute><RateReview /></ProtectedRoute>} />
        
        {/* Wallet (protégé) */}
        <Route path="/wallet" element={<ProtectedRoute><WalletHome /></ProtectedRoute>} />
        <Route path="/wallet/topup" element={<ProtectedRoute><TopUpWallet /></ProtectedRoute>} />
        <Route path="/wallet/transaction/:id" element={<ProtectedRoute><TransactionDetail /></ProtectedRoute>} />
        
        {/* Profile (protégé) */}
        <Route path="/profile" element={<ProtectedRoute><ClientProfile /></ProtectedRoute>} />
        <Route path="/profile/stories-archive" element={<ProtectedRoute><StoriesArchive /></ProtectedRoute>} />
        <Route path="/profile/edit" element={<ProtectedRoute><EditPersonalInfo /></ProtectedRoute>} />
        <Route path="/profile/privacy" element={<ProtectedRoute><PrivacySettings /></ProtectedRoute>} />
        <Route path="/profile/notifications" element={<ProtectedRoute><NotificationsSettings /></ProtectedRoute>} />
        <Route path="/profile/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
        
        {/* Professional (protégé) */}
        <Route path="/professional/dashboard" element={<ProtectedRoute><ProfessionalDashboard /></ProtectedRoute>} />
        <Route path="/professional/profile" element={<ProtectedRoute><ProfessionalProfileScreen /></ProtectedRoute>} />
        <Route path="/professional/services" element={<ProtectedRoute><ManageServices /></ProtectedRoute>} />
        <Route path="/professional/services/create" element={<ProtectedRoute><CreateEditService /></ProtectedRoute>} />
        <Route path="/professional/calendar" element={<ProtectedRoute><CalendarManagement /></ProtectedRoute>} />
        <Route path="/professional/bookings" element={<ProtectedRoute><BookingRequest /></ProtectedRoute>} />
        <Route path="/professional/bookings/active/:id" element={<ProtectedRoute><ActiveBooking /></ProtectedRoute>} />
        <Route path="/professional/finances" element={<ProtectedRoute><FinancialDashboard /></ProtectedRoute>} />
        <Route path="/professional/finances/withdraw" element={<ProtectedRoute><WithdrawalRequest /></ProtectedRoute>} />
        <Route path="/professional/reviews" element={<ProtectedRoute><ReviewsManagement /></ProtectedRoute>} />
        <Route path="/professional/settings" element={<ProtectedRoute><ProfessionalSettings /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App

