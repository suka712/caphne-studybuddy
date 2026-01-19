# Caphne.co Development

## Frontend

###  Foundation
- [x] Nuxt 3 + Tailwind + Supabase setup
- [x] Auth flow (signup, login, logout, middleware)
- [x] Base layout

### Onboarding `/start`
- [ ] Multi-step form with progress indicator
- [ ] Steps: basics → intents → tags (skills/interests/vibes) → learn-teach-explore → bio & photo → discoverability
- [ ] Profile creation API + storage

### Discover `/discover`
- [ ] Profile card component
- [ ] Swipe mechanics (left/right)
- [ ] Match popup on mutual swipe
- [ ] Queue API (exclude swiped, apply filters, basic scoring)

### Matches `/matches`
- [ ] Match list with last message preview
- [ ] Unread indicator

### Chat `/chat/:matchId`
- [ ] Message thread UI
- [ ] Send/receive messages
- [ ] Real-time updates
- [ ] Icebreaker prompt

### Profile
- [ ] View own profile `/profile`
- [ ] Edit profile `/profile/edit`
- [ ] View others `/u/:userId`

### Settings `/settings`
- [ ] Account management
- [ ] Language toggle
- [ ] Delete account

### Browse `/browse` (P2)
- [ ] Public profile discovery
- [ ] Search/filter

---

## Backend  

- All services should be implemented as needed by the frontend

---

## Database
- profiles, user_intents, tags, user_tags, swipes, matches, messages and such as needed by the backend

### Database seed
- Default tags (skills, interests, vibes)
- Test users
