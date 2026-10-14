import { gql } from "graphql-tag";

const typeDefs = gql`
  enum UserRole {
    USER
    CENTRE
    ADMIN
  }

  type User {
    id: ID!
    email: String!
    phone: String
    role: UserRole!
    isVerified: Boolean!
  }

  type AuthPayload {
    token: String
    message: String!
    user: User
  }

  enum Gender {
    MALE
    FEMALE
    OTHER
  }

  enum MaritalStatus {
    NEVER_MARRIED
    DIVORCED
    WIDOWED
    SEPARATED
  }

  type Profile {
    id: ID!
    userId: ID
    createdByCentreId: ID
    createdByType: String! # 'SELF' அல்லது 'CENTRE'
    fullName: String!
    gender: String!
    dateOfBirth: String
    religion: String
    caste: String
    maritalStatus: MaritalStatus
    education: String
    occupation: String
    income: String
    height: Float
    city: String
    district: String
    state: String
    country: String
    aboutMe: String
    clientPhone: String
    createdAt: String
  }

  # 1. தனிநபர் பயனர் தன் சொந்த ப்ரொபைலை உருவாக்க
  input CreateMyProfileInput {
    fullName: String!
    gender: String!
    dateOfBirth: String
    religion: String
    caste: String
    maritalStatus: MaritalStatus
    education: String
    occupation: String
    income: String
    height: Float
    city: String
    district: String
    state: String
    country: String
    aboutMe: String
  }

  # 2. தகவல் மையம் வாடிக்கையாளருக்கு ப்ரொபைல் உருவாக்க
  input CreateCentreProfileInput {
    fullName: String!
    gender: Gender!
    dateOfBirth: String
    religion: String
    caste: String
    maritalStatus: MaritalStatus
    education: String
    occupation: String
    income: String
    height: Float
    city: String
    district: String
    state: String
    country: String
    aboutMe: String
    clientPhone: String! # வாடிக்கையாளரின் போன் நம்பர்
  }
  input ProfileFilterInput {
    gender: Gender
    religion: String
    caste: String
    district: String
    districts: [String!]
    maritalStatus: MaritalStatus
    minAge: Int
    maxAge: Int
  }

  enum InterestStatus {
    PENDING
    ACCEPTED
    REJECTED
  }

  type InterestRequest {
    id: ID!
    senderProfile: Profile!
    receiverProfile: Profile!
    status: InterestStatus!
    createdAt: String!
  }

  input HoroscopeInput {
    star: String
    raasi: String
    dosham: String
    birthTime: String
    birthPlace: String
    horoscopeUrl: String
  }

  type Message {
    id: ID!
    senderProfile: Profile!
    receiverProfile: Profile!
    content: String!
    isRead: Boolean!
    createdAt: String!
  }
  input PrivacySettingsInput {
    isPhotoLocked: Boolean!
  }

  type Query {
    me: User

    getMyProfile: Profile
  }

  extend type Query {
    searchProfiles(
      filter: ProfileFilterInput!
      page: Int
      limit: Int
    ): [Profile!]!
  }

  type Mutation {
    # 1. கணக்கு பதிவு செய்து OTP அனுப்ப
    register(
      phone: String!
      email: String!
      password: String!
      role: UserRole
    ): AuthPayload!

    # 2. OTP சரிபார்த்து லாகின் அனுமதி பெற
    verifyOtp(email: String!, otp: String!): AuthPayload!

    # 3. புதிய OTP மீண்டும் அனுப்பॆ
    resendOtp(email: String!): AuthPayload!

    # 4. லாகின் செய்தல் (Verified பயனர்களுக்கு மட்டுமே)
    login(email: String!, password: String!): AuthPayload!

    # தனிநபர் பயனர் லாகின் செய்த பின் இயக்கும் Mutation
    createMyProfile(input: CreateMyProfileInput!): Profile!

    # தகவல் மையம் லாகின் செய்த பின் இயக்கும் Mutation
    createProfileByCentre(input: CreateCentreProfileInput!): Profile!
  }

  # typeDefs.js

  extend type Query {
    #Admin code
    # 1. அட்மின் அனைத்து பயனர்களையும் (Users) பார்க்க
    getAllUsers(role: UserRole): [User!]!
    # எனக்கு வந்த விருப்பங்களின் பட்டியல்
    getReceivedInterests: [InterestRequest!]!

    # நான் அனுப்பிய விருப்பங்களின் பட்டியல்
    getSentInterests: [InterestRequest!]!

    getShortlistedProfiles: [Profile!]!

    getMessages(profileId: ID!): [Message!]!

    isProfileUnlocked(profileId: ID!): Boolean!
  }

  extend type Mutation {
    # Base64 string-ஆக படத்தை அனுப்பும் Mutation
    uploadProfilePhoto(imageBase64: String!): Profile!

    # எந்த ப்ரொபைல் (profileId) மற்றும் என்ன படம் (imageBase64) என்பதை அனுப்ப வேண்டும்
    uploadCentreClientPhoto(profileId: ID!, imageBase64: String!): Profile!

    #Admin code
    # 2. பயனரை Verify செய்ய (Verify User)
    verifyUserByAdmin(userId: ID!): User!

    # 3. பயனரை Activate / Deactivate செய்ய (Active / Inactive Status)
    toggleUserActiveStatus(userId: ID!, isActive: Boolean!): User!

    # 1. பாஸ்வேர்ட் மறந்துவிட்டால் OTP அனுப்ப
    forgotPassword(email: String!): AuthPayload!

    # 2. OTP சரிபார்த்து புதிய பாஸ்வேர்ட் மாற்ற
    resetPassword(
      email: String!
      otp: String!
      newPassword: String!
    ): AuthPayload!

    # 1. விருப்பம் அனுப்புதல்
    sendInterest(receiverProfileId: ID!): InterestRequest!

    # 2. வந்த விருப்பத்திற்கு பதிலளிப்பது (Accept/Reject)
    respondToInterest(requestId: ID!, status: InterestStatus!): InterestRequest!

    updateHoroscopeDetails(profileId: ID!, horoscope: HoroscopeInput!): Profile!
    toggleShortlist(profileId: ID!): Boolean!

    sendMessage(receiverProfileId: ID!, content: String!): Message!

    unlockProfile(profileId: ID!, paymentId: String!, amount: Float!): Boolean!
    
    updatePrivacySettings(privacySettings: PrivacySettingsInput!): Profile!
  }
`;

export default typeDefs;

