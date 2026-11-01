---- MODULE W4 ----
EXTENDS Naturals
VARIABLES s, prepared, q
vars == <<s, prepared, q>>
Init == s = "booked" /\ prepared = FALSE /\ q = 0
Prepare == s = "booked" /\ s' = "prepared" /\ prepared' = TRUE /\ UNCHANGED q
Teach == s = "prepared" /\ s' = "teaching" /\ UNCHANGED <<prepared, q>>
Ask == s = "teaching" /\ q < 2 /\ q' = q + 1 /\ UNCHANGED <<s, prepared>>
Wrap == s = "teaching" /\ s' = "followup" /\ UNCHANGED <<prepared, q>>
SendNotes == s = "followup" /\ s' = "done" /\ UNCHANGED <<prepared, q>>
Next == Prepare \/ Teach \/ Ask \/ Wrap \/ SendNotes
Spec == Init /\ [][Next]_vars
TeachingNeedsPrep == s \in {"teaching","followup","done"} => prepared
AtMostTwoQuestions == q <= 2
====
