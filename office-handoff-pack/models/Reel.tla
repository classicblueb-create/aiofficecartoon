---- MODULE Reel ----
EXTENDS Naturals
CONSTANT GateProofread
VARIABLES phase, format, matte, proofread, assetsAsked, placeholders, flags, disclosed
vars == <<phase, format, matte, proofread, assetsAsked, placeholders, flags, disclosed>>

Init ==
  /\ phase = "intake" /\ format = "none" /\ matte = "unknown"
  /\ proofread = FALSE /\ assetsAsked = FALSE
  /\ placeholders = 0 /\ flags = 0 /\ disclosed = FALSE

ChooseFormat ==
  /\ phase = "intake"
  /\ phase' = "format chosen"
  /\ format' \in {"split", "cutout", "essay"}
  /\ UNCHANGED <<matte, proofread, assetsAsked, placeholders, flags, disclosed>>

Transcribe ==
  /\ phase = "format chosen"
  /\ phase' = "transcribed"
  /\ UNCHANGED <<format, matte, proofread, assetsAsked, placeholders, flags, disclosed>>

ProofreadThai ==
  /\ phase = "transcribed" /\ ~proofread
  /\ proofread' = TRUE
  /\ UNCHANGED <<phase, format, matte, assetsAsked, placeholders, flags, disclosed>>

WritePlan ==
  /\ phase = "transcribed"
  /\ (GateProofread => proofread)
  /\ phase' = "planned"
  /\ UNCHANGED <<format, matte, proofread, assetsAsked, placeholders, flags, disclosed>>

AskForAssets ==
  /\ phase = "planned"
  /\ phase' = "assets requested"
  /\ assetsAsked' = TRUE
  /\ placeholders' \in {0, 1}
  /\ UNCHANGED <<format, matte, proofread, flags, disclosed>>

TryMatte ==
  /\ format = "cutout" /\ matte = "unknown"
  /\ matte' \in {"ok", "failed"}
  /\ UNCHANGED <<phase, format, proofread, assetsAsked, placeholders, flags, disclosed>>

FallBackToSplit ==
  /\ format = "cutout" /\ matte = "failed"
  /\ format' = "split"
  /\ UNCHANGED <<phase, matte, proofread, assetsAsked, placeholders, flags, disclosed>>

Build ==
  /\ phase = "assets requested"
  /\ format # "cutout" \/ matte = "ok"
  /\ phase' = "built"
  /\ UNCHANGED <<format, matte, proofread, assetsAsked, placeholders, flags, disclosed>>

Render ==
  /\ phase = "built"
  /\ phase' = "rendered"
  /\ flags' \in {0, 1}
  /\ UNCHANGED <<format, matte, proofread, assetsAsked, placeholders, disclosed>>

FixFlags ==
  /\ phase = "rendered" /\ flags = 1
  /\ phase' = "built"
  /\ flags' = 0
  /\ UNCHANGED <<format, matte, proofread, assetsAsked, placeholders, disclosed>>

Deliver ==
  /\ phase = "rendered" /\ flags = 0
  /\ phase' = "delivered"
  /\ disclosed' = (placeholders > 0)
  /\ UNCHANGED <<format, matte, proofread, assetsAsked, placeholders, flags>>

Done == phase = "delivered" /\ UNCHANGED vars

Next == ChooseFormat \/ Transcribe \/ ProofreadThai \/ WritePlan \/ AskForAssets
     \/ TryMatte \/ FallBackToSplit \/ Build \/ Render \/ FixFlags \/ Deliver \/ Done
Spec == Init /\ [][Next]_vars

Built == phase \in {"built", "rendered", "delivered"}
AssetsAskedBeforeBuild == Built => assetsAsked
CutoutNeedsMatte == (Built /\ format = "cutout") => matte = "ok"
DeliveredIsClean == phase = "delivered" => flags = 0
PlaceholdersDisclosed == (phase = "delivered" /\ placeholders > 0) => disclosed
ThaiProofreadBeforeBuild == Built => proofread
====
