---- MODULE W3 ----
VARIABLES bot, user
vars == <<bot, user>>
Init == bot = "idle" /\ user = "quiet"
Send == bot = "idle" /\ user = "quiet" /\ bot' = "thinking" /\ user' = "waiting"
Reply == bot = "thinking" /\ bot' = "replied" /\ user' = "reading"
Done == bot = "replied" /\ user = "reading" /\ bot' = "idle" /\ user' = "quiet"
Next == Send \/ Reply \/ Done
Spec == Init /\ [][Next]_vars
NoReplyToNobody == bot = "replied" => user # "quiet"
ThinkingMeansWaiting == bot = "thinking" => user = "waiting"
====
