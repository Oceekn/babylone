import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import type { FutureConfig } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute'
import WelcomeScreen from './screens/onboarding/WelcomeScreen'
import SignUpPersonalInfo from './screens/onboarding/SignUpPersonalInfo'
import SignUpContact from './screens/onboarding/SignUpContact'
import VerificationScreen from './screens/onboarding/VerificationScreen'
import ProfessionalSignUp from './screens/onboarding/ProfessionalSignUp'
import LoginScreen from './screens/onboarding/LoginScreen'
import PasswordRecoveryScreen from './screens/onboarding/PasswordRecoveryScreen'
import ClientHomeFeed from './screens/client/ClientHomeFeed'
import MessagesList from './screens/messages/MessagesList'
import NewConversation from './screens/messages/NewConversation'
import IndividualChat from './screens/messages/IndividualChat'
import GroupChat from './screens/messages/GroupChat'
import GroupInfo from './screens/messages/GroupInfo'
import CallScreen from './screens/messages/CallScreen'
import SocialFeed from './screens/social/SocialFeed'
import PostDetail from './screens/social/PostDetail'
import CreatePost from './screens/social/CreatePost'
import CreateStory from './screens/social/CreateStory'
import StoryViewer from './screens/social/StoryViewer'
import UserProfile from './screens/social/UserProfile'
import SearchUsers from './screens/social/SearchUsers'
import FollowersList from './screens/social/FollowersList'
import FollowingList from './screens/social/FollowingList'
import GroupsDiscovery from './screens/social/GroupsDiscovery'
import GroupPage from './screens/social/GroupPage'
import ServicesSearch from './screens/services/ServicesSearch'
import AdvancedFilters from './screens/services/AdvancedFilters'
import SearchResults from './screens/services/SearchResults'
import MapView from './screens/services/MapView'
import ProfessionalProfile from './screens/services/ProfessionalProfile'
import ServiceSelection from './screens/services/ServiceSelection'
import ServiceDetail from './screens/services/ServiceDetail'
import BookingCalendar from './screens/services/BookingCalendar'
import PaymentMethod from './screens/services/PaymentMethod'
import PaymentConfirmation from './screens/services/PaymentConfirmation'
import MyBookingsList from './screens/bookings/MyBookingsList'
import BookingDetail from './screens/bookings/BookingDetail'
import ActiveBookingTracking from './screens/bookings/ActiveBookingTracking'
import RescheduleBooking from './screens/bookings/RescheduleBooking'
import RateReview from './screens/bookings/RateReview'
import WalletHome from './screens/wallet/WalletHome'
import TopUpWallet from './screens/wallet/TopUpWallet'
import TransactionDetail from './screens/wallet/TransactionDetail'
import ClientProfile from './screens/profile/ClientProfile'
import EditPersonalInfo from './screens/profile/EditPersonalInfo'
import PrivacySettings from './screens/profile/PrivacySettings'
import NotificationsSettings from './screens/profile/NotificationsSettings'
import Favorites from './screens/profile/Favorites'
import StoriesArchive from './screens/profile/StoriesArchive'
import ProfessionalDashboard from './screens/professional/ProfessionalDashboard'
import ProfessionalProfileScreen from './screens/professional/ProfessionalProfileScreen'
import ManageServices from './screens/professional/ManageServices'
import CreateEditService from './screens/professional/CreateEditService'
import CalendarManagement from './screens/professional/CalendarManagement'
import BookingRequest from './screens/professional/BookingRequest'
import ActiveBooking from './screens/professional/ActiveBooking'
import FinancialDashboard from './screens/professional/FinancialDashboard'
import WithdrawalRequest from './screens/professional/WithdrawalRequest'
import ReviewsManagement from './screens/professional/ReviewsManagement'
import ProfessionalSettings from './screens/professional/ProfessionalSettings'

const routerFutureFlags: FutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}

function App() {
  return (
    <Router future={routerFutureFlags}>
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
    </Router>
  )
}

export default App

