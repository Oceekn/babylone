import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
import CreatePost from './screens/social/CreatePost'
import CreateStory from './screens/social/CreateStory'
import StoryViewer from './screens/social/StoryViewer'
import UserProfile from './screens/social/UserProfile'
import SearchUsers from './screens/social/SearchUsers'
import GroupsDiscovery from './screens/social/GroupsDiscovery'
import GroupPage from './screens/social/GroupPage'
import ServicesSearch from './screens/services/ServicesSearch'
import AdvancedFilters from './screens/services/AdvancedFilters'
import SearchResults from './screens/services/SearchResults'
import MapView from './screens/services/MapView'
import ProfessionalProfile from './screens/services/ProfessionalProfile'
import ServiceSelection from './screens/services/ServiceSelection'
import BookingCalendar from './screens/services/BookingCalendar'
import PaymentMethod from './screens/services/PaymentMethod'
import PaymentConfirmation from './screens/services/PaymentConfirmation'
import MyBookingsList from './screens/bookings/MyBookingsList'
import BookingDetail from './screens/bookings/BookingDetail'
import ActiveBookingTracking from './screens/bookings/ActiveBookingTracking'
import RateReview from './screens/bookings/RateReview'
import WalletHome from './screens/wallet/WalletHome'
import TopUpWallet from './screens/wallet/TopUpWallet'
import TransactionDetail from './screens/wallet/TransactionDetail'
import ClientProfile from './screens/profile/ClientProfile'
import EditPersonalInfo from './screens/profile/EditPersonalInfo'
import PrivacySettings from './screens/profile/PrivacySettings'
import NotificationsSettings from './screens/profile/NotificationsSettings'
import Favorites from './screens/profile/Favorites'
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

function App() {
  return (
    <Router>
      <Routes>
        {/* Onboarding & Auth */}
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/signup/personal" element={<SignUpPersonalInfo />} />
        <Route path="/signup/contact" element={<SignUpContact />} />
        <Route path="/signup/verification" element={<VerificationScreen />} />
        <Route path="/signup/professional" element={<ProfessionalSignUp />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/password-recovery" element={<PasswordRecoveryScreen />} />
        
        {/* Client Screens */}
        <Route path="/client/home" element={<ClientHomeFeed />} />
        
        {/* Messages */}
        <Route path="/messages" element={<MessagesList />} />
        <Route path="/messages/new" element={<NewConversation />} />
        <Route path="/messages/chat/:id" element={<IndividualChat />} />
        <Route path="/messages/group/:id" element={<GroupChat />} />
        <Route path="/messages/group/:id/info" element={<GroupInfo />} />
        <Route path="/messages/call" element={<CallScreen />} />
        
        {/* Social */}
        <Route path="/social" element={<SocialFeed />} />
        <Route path="/social/create-post" element={<CreatePost />} />
        <Route path="/social/create-story" element={<CreateStory />} />
        <Route path="/social/story/:id" element={<StoryViewer />} />
        <Route path="/social/profile/:id" element={<UserProfile />} />
        <Route path="/social/search-users" element={<SearchUsers />} />
        <Route path="/social/groups" element={<GroupsDiscovery />} />
        <Route path="/social/group/:id" element={<GroupPage />} />
        
        {/* Services */}
        <Route path="/services" element={<ServicesSearch />} />
        <Route path="/services/filters" element={<AdvancedFilters />} />
        <Route path="/services/results" element={<SearchResults />} />
        <Route path="/services/map" element={<MapView />} />
        <Route path="/services/professional/:id" element={<ProfessionalProfile />} />
        <Route path="/services/select" element={<ServiceSelection />} />
        <Route path="/services/booking" element={<BookingCalendar />} />
        <Route path="/services/payment" element={<PaymentMethod />} />
        <Route path="/services/payment/confirmation" element={<PaymentConfirmation />} />
        
        {/* Bookings */}
        <Route path="/bookings" element={<MyBookingsList />} />
        <Route path="/bookings/:id" element={<BookingDetail />} />
        <Route path="/bookings/:id/tracking" element={<ActiveBookingTracking />} />
        <Route path="/bookings/:id/review" element={<RateReview />} />
        
        {/* Wallet */}
        <Route path="/wallet" element={<WalletHome />} />
        <Route path="/wallet/topup" element={<TopUpWallet />} />
        <Route path="/wallet/transaction/:id" element={<TransactionDetail />} />
        
        {/* Profile */}
        <Route path="/profile" element={<ClientProfile />} />
        <Route path="/profile/edit" element={<EditPersonalInfo />} />
        <Route path="/profile/privacy" element={<PrivacySettings />} />
        <Route path="/profile/notifications" element={<NotificationsSettings />} />
        <Route path="/profile/favorites" element={<Favorites />} />
        
        {/* Professional */}
        <Route path="/professional/dashboard" element={<ProfessionalDashboard />} />
        <Route path="/professional/profile" element={<ProfessionalProfileScreen />} />
        <Route path="/professional/services" element={<ManageServices />} />
        <Route path="/professional/services/create" element={<CreateEditService />} />
        <Route path="/professional/calendar" element={<CalendarManagement />} />
        <Route path="/professional/bookings" element={<BookingRequest />} />
        <Route path="/professional/bookings/active/:id" element={<ActiveBooking />} />
        <Route path="/professional/finances" element={<FinancialDashboard />} />
        <Route path="/professional/finances/withdraw" element={<WithdrawalRequest />} />
        <Route path="/professional/reviews" element={<ReviewsManagement />} />
        <Route path="/professional/settings" element={<ProfessionalSettings />} />
      </Routes>
    </Router>
  )
}

export default App

