import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth } from '../../lib/firebase'

/** Email/jelszó regisztráció displayName-mel */
export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<void> {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(cred.user, { displayName: displayName.trim() })
}

/** Email/jelszó bejelentkezés */
export async function signIn(email: string, password: string): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password)
}

/** Kijelentkezés */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}
