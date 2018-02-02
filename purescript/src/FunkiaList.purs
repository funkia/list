module Data.FunkiaList
  ( List
  , pair
  , head
  , filter
  , empty
  , cons
  , fromFoldable
  ) where

import Data.Maybe (Maybe)
import Data.Monoid (class Monoid)
import Data.Foldable (class Foldable, foldMapDefaultR, foldr)

import Prelude hiding (append, map)

foreign import data List :: Type -> Type

foreign import pair :: forall a. a -> a -> List a

foreign import head :: forall a. List a -> Maybe a

foreign import empty :: forall a. List a

foreign import cons :: forall a. a -> List a -> List a

foreign import snoc :: forall a. List a -> a -> List a

foreign import _map ∷ forall a b. (a -> b) -> List a -> List b

foreign import filter :: forall a. (a -> Boolean) -> List a -> List a

instance functorList ∷ Functor List where
  map = _map

foreign import _append ∷ forall a. List a -> List a -> List a

instance semigroupList ∷ Semigroup (List a) where
  append = _append

instance monoidSeq :: Monoid (List a) where
  mempty = empty

foreign import _foldr :: forall a b. (a -> b -> b) -> b -> List a -> b

foreign import _foldl :: forall a b. (b -> a -> b) -> b -> List a -> b

instance foldableList :: Foldable List where
  foldr = _foldr
  foldl = _foldl
  foldMap = foldMapDefaultR

fromFoldable :: forall f. Foldable f => f ~> List
fromFoldable = foldr cons empty