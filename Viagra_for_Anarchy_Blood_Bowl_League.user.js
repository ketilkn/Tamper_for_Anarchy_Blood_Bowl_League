// ==UserScript==
// @name         Viagra for Anarchy Blood Bowl League
// @namespace    http://www.anarchy.bloodbowlleague.com/
// @version      0.9
// @description  Convert onclick to anchor for bloodbowlleague.com
// @author       Ketil Nordstad
// @match        http://*.bloodbowlleague.com/*
// @match        http://www.arosbb.dk/*
// @grant        none
// @updateURL    https://openuserjs.org/src/scripts/ketilkn/Viagra_for_Anarchy_Blood_Bowl_League.user.js#  
// @downloadURL  https://openuserjs.org/src/scripts/ketilkn/Viagra_for_Anarchy_Blood_Bowl_League.user.js#  
// ==/UserScript==

// 0.1: Initial version. Replace onclick player, match with anchor. Remove timeout and add keep alive
// 0.2: Replace tournament table onclick with anchor. Team name link to team. Team value link to roster.
// 0.3: Replace menu onclick with a href 
// 0.4: Support all leagues at bloodbowlleague.com
// 0.5: Added tooltip to league standings. Click on team value to open roster directly.
// 0.6: Auto update test
// 0.7: Searchable bounty selector, support for arosbb.dk.
// 0.8: Improved bounty selector. Support for arrowkeys. Fixed empty search text bug.
// 0.9: Added search to new match 

(function() {
    'use strict';

    var skills = {"regeneration": {"category": "extraordinary", "text": "If the player suffers a Casualty result on the Injury table, then roll a D6 for Regeneration after the roll on the Casualty table and after any Apothecary roll if allowed. On a result of 1-3, the player suffers the result of this injury. On a 4-6, the player will heal the injury after a short period of time to 're-organise' himself, and is placed in the Reserves box instead. Regeneration rolls may not be re-rolled. Note that opposing players still earn Star Player points as normal for inflicting a Casualty result on a player with this skill, even if the result doesn't affect the player in the normal way.  ", "title": "Regeneration", "id": "regeneration"}, "prehensile-tail": {"category": "mutation", "text": "The player has a long, thick tail which he can use to trip up opposing players. To represent this, opposing players must subtract 1 from the D6 roll if they attempt to dodge out of any of the player's tackle zones.  ", "title": "Prehensile Tail", "id": "prehensile-tail"}, "wild-animal": {"category": "extraordinary", "text": "Wild Animals are uncontrollable creatures that rarely do exactly what a coach wants of them. In fact, just about all you can really rely on them to do is lash out at opposing players that move too close to them! To represent this, immediately after declaring an Action with a Wild Animal, roll a D6, adding 2 to the roll if taking a Block or Blitz Action. On a roll of 1-3, the Wild Animal does not move and roars in rage instead, and the Action is wasted. ", "title": "Wild Animal", "id": "wild-animal"}, "disturbing-presence": {"category": "mutation", "text": "This player's presence is very disturbing, whether it is caused by a massive cloud of flies, sprays of soporific musk, an aura of random chaos or intense cold, or a pheromone that causes fear and panic. Regardless of the nature of this mutation, any player must subtract 1 from the D6 when they pass, intercept or catch for each opposing player with Disturbing Presence that is within three squares of them, even if the Disturbing Presence player is Prone or Stunned.  ", "title": "Disturbing Presence", "id": "disturbing-presence"}, "jump-up": {"category": "agility", "text": "A player with this skill is able to quickly get back into the game. If the player declares any Action other than a Block Action he may stand up for free without paying the three squares of movement. The player may also declare a Block Action while Prone which requires an Agility roll with a +2 modifier to see if he can complete the Action. A successful roll means the player can stand up for free and block an adjacent opponent. A failed roll means the Block Action is wasted and the player may not stand up.  ", "title": "Jump Up", "id": "jump-up"}, "chainsaw": {"category": "extraordinary", "text": "A player armed with a chainsaw must attack with it instead of making a block as part of a Block or Blitz Action. When the chainsaw is used to make an attack, roll a D6 instead of the Block dice. On a roll of 2 or more the chainsaw hits the opposing player, but on a roll of 1 it 'kicks back' and hits the wielder instead! Make an Armour roll for the player hit by the chainsaw, adding 3 to the score. If the roll beats the victim's Armour value then the victim is Knocked Down and injured - roll on the Injury table. If the roll fails to beat the victim's Armour value then the attack has no effect. A player armed with a chainsaw may take a Foul Action, and adds 3 to the Armour roll, but must roll for kick back as described above. A running chainsaw is a dangerous thing to carry around, and so if a player holding a chainsaw is Knocked Down for any reason, the opposing coach is allowed to add 3 to his Armour roll to see if the player was injured. However blocking a player with a chainsaw is equally dangerous, if an opponent knocks himself over when blocking the chainsaw player then add 3 to his Armour roll. This skill may only be used once per turn (i.e. cannot be used with Frenzy or Multiple Block) and if used as part of a Blitz Action, the player cannot continue moving after using it. Casualties caused by a chainsaw player do not count for Star Player points.  ", "title": "Chainsaw", "id": "chainsaw"}, "sure-feet": {"category": "agility", "text": "The player may re-roll the D6 if he is Knocked Down when trying to Go For It (see page 20). A player may only use the Sure Feet skill once per turn. ", "title": "Sure Feet", "id": "sure-feet"}, "accurate": {"category": "passing", "text": "The player may add 1 to the D6 roll when he passes.  ", "title": "Accurate", "id": "accurate"}, "thick-skull": {"category": "strength", "text": "This player treats a roll of 8 on the Injury table, after any modifiers have been applied, as a Stunned result rather than a KO'd result. This skill may be used even if the player is Prone or Stunned.  ", "title": "Thick Skull", "id": "thick-skull"}, "break-tackle": {"category": "strength", "text": "The player may use his Strength instead of his Agility when making a Dodge roll. For example, a player with Strength 4 and Agility 2 would count as having an Agility of 4 when making a Dodge roll. This skill may only be used once per turn. ", "title": "Break Tackle", "id": "break-tackle"}, "shadowing": {"category": "general", "text": "The player may use this skill when a player performing an Action on the opposing team moves out of any of his tackle zones for any reason. The opposing player rolls 2D6 adding their own player's movement allowance and subtracting the Shadowing player's movement allowance from the score. If the final result is 7 or less, the player with Shadowing may move into the square vacated by the opposing player. He does not have to make any Dodge rolls when he makes this move, and it has no effect on his own movement in his own turn. If the final result is 8 or more, the opposing player successfully avoids the Shadowing player and the Shadowing player is left standing. A player may make any number of shadowing moves per turn. If a player has left the tackle zone of several players that have the Shadowing skill, then only one of the opposing players may attempt to shadow him.  ", "title": "Shadowing", "id": "shadowing"}, "sneaky-git": {"category": "agility", "text": "This player has the quickness and finesse to stick the boot to a downed opponent without drawing a referee's attention unless he hears the armour crack. During a Foul Action a player with this skill is not ejected for rolling doubles on the Armour roll unless the Armour roll was successful.  ", "title": "Sneaky Git", "id": "sneaky-git"}, "stand-firm": {"category": "strength", "text": "A player with this skill may choose to not be pushed back as the result of a block. He may choose to ignore being pushed by 'Pushed' results, and to have 'Knock-down' results knock the player down in the square where he started. If a player is pushed back into a player with using Stand Firm then neither player moves.  ", "title": "Stand Firm", "id": "stand-firm"}, "claw-/-claws": {"category": "mutation", "text": "A player with this skill is blessed with a huge crab like claw or razor sharp talons that make armour useless. When an opponent is Knocked Down by this player during a block, any Armour roll of 8 or more after modifications automatically breaks armour.  ", "title": "Claw / Claws", "id": "claw-/-claws"}, "throw-team-mate": {"category": "extraordinary", "text": "A player with this skill has the ability to throw a player from the same team instead of the ball! (This includes the ball if the player thrown already has it!) The player throwing must end the movement of his Pass Action standing next to the intended team-mate to be thrown, who must have the Right Stuff skill and be standing. The pass is worked out exactly the same as the player with Throw Team-Mate passing a ball, except the player must subtract 1 from the D6 roll when he passes the player, fumbles are not automatically turnovers, and Long Pass or Long Bomb range passes are not possible. In addition, accurate passes are treated instead as inaccurate passes thus scattering the player three times as players are heavier and harder to pass than a ball. The thrown player cannot be intercepted. A fumbled team-mate will land in the square he originally occupied. If the thrown player scatters off the pitch, he is beaten up by the crowd in the same manner as a player who has been pushed off the pitch. If the final square he scatters into is occupied by another player, treat the player landed on as Knocked Down and roll for Armour (even if already Prone or Stunned), and then the player being thrown will scatter one more square. If the thrown player would land on another player, continue to scatter the thrown player until he ends up in an empty square or off the pitch (i.e. he cannot land on more than one player). See the Right Stuff entry to see if the player lands on his feet or head-down in a crumpled heap!  ", "title": "Throw Team-Mate", "id": "throw-team-mate"}, "pro": {"category": "general", "text": "A player with this skill is a hardened veteran. Such players are called professionals or Pros by other Blood Bowl players because they rarely make a mistake. Once per turn, a Pro is allowed to re-roll any one dice roll he has made other than Armour, Injury or Casualty, even if he is Prone or Stunned. However, before the re-roll may be made, his coach must roll a D6. On a roll of 4, 5 or 6 the re-roll may be made. On a roll of 1, 2 or 3 the original result stands and may not be re-rolled with a skill or team re-roll; however you can re-roll the Pro roll with a Team re-roll.  ", "title": "Pro", "id": "pro"}, "block": {"category": "general", "text": "A player with the Block skill is proficient at knocking opponents down. The Block skill, if used, affects the results rolled with the Block dice, as explained in the Blocking rules. ", "title": "Block", "id": "block"}, "sure-hands": {"category": "general", "text": "A player with the Sure Hands skill is allowed to re-roll the D6 if he fails to pick up the ball. In addition, the Strip Ball skill will not work against a player with this skill.  ", "title": "Sure Hands", "id": "sure-hands"}, "stakes": {"category": "extraordinary", "text": "This player is armed with special stakes that are blessed to cause extra damage to the Undead and those that work with them. This player may add 1 to the Armour roll when they make a Stab attack against any player playing for a Khemri, Necromantic, Undead or Vampire team.  ", "title": "Stakes", "id": "stakes"}, "titchy": {"category": "extraordinary", "text": "Titchy players tend to be even smaller and more nimble than other Stunty players. To represent this, the player may add 1 to any Dodge roll he attempts. On the other hand, while opponents do have to dodge to leave any of a Titchy player's tackle zones, Titchy players are so small that they do not exert a -1 modifier when opponents dodge into any of their tackle zones. ", "title": "Titchy", "id": "titchy"}, "mighty-blow": {"category": "strength", "text": "Add 1 to any Armour or Injury roll made by a player with this skill when an opponent is Knocked Down by this player during a block. Note that you only modify one of the dice rolls, so if you decide to use Mighty Blow to modify the Armour roll, you may not modify the Injury roll as well. Mighty Blow cannot be used with the Stab or Chainsaw skills.  ", "title": "Mighty Blow", "id": "mighty-blow"}, "leap": {"category": "agility", "text": "A player with the Leap skill is allowed to jump to any empty square within 2 squares even if it requires jumping over a player from either team. Making a leap costs the player two squares of movement. In order to make the leap, move the player to any empty square 1 to 2 squares from their current square and then make an Agility roll for the player. No modifiers apply to this D6 roll unless he has Very Long Legs. The player does not have to dodge to leave the square he starts in. If the player successfully makes the D6 roll then they make a perfect jump and may carry on moving. If the player fails the Agility roll then he is Knocked Down in the square that he was leaping to, and the opposing coach makes an Armour roll to see if he was injured. A player may only use the Leap skill once per turn.  ", "title": "Leap", "id": "leap"}, "secret-weapon": {"category": "extraordinary", "text": "Some players are armed with special pieces of equipment that are called 'secret weapons'. Although the Blood Bowl rules specifically ban the use of any weapons, the game has a long history of teams trying to get weapons of some sort onto the pitch. Nonetheless, the use of secret weapons is simply not legal, and referees have a nasty habit of sending off players that use them. Once a drive ends that this player has played in at any point, the referee orders the player to be sent off to the dungeon to join players that have been caught committing fouls during the match regardless of whether the player is still on the pitch or not.  ", "title": "Secret Weapon", "id": "secret-weapon"}, "dirty-player": {"category": "general", "text": "A player with this skill has trained long and hard to learn every dirty trick in the book. Add 1 to any Armour roll or Injury roll made by a player with this skill when they make a Foul as part of a Foul Action. Note that you may only modify one of the dice rolls, so if you decide to use Dirty Player to modify the Armour roll, you may not modify the Injury roll as well.  ", "title": "Dirty Player", "id": "dirty-player"}, "frenzy": {"category": "general", "text": "A player with this skill is a slavering psychopath who attacks his opponents in an uncontrollable rage. Unless otherwise overridden, this skill must always be used. When making a block, a player with this skill must always follow up if they can. If a 'Pushed' or 'Defender Stumbles' result was chosen, the player must immediately throw a second block against the same opponent so long as they are both still standing and adjacent. If possible the player must also follow up this second block. If the frenzied player is performing a Blitz Action then he must pay a square of Movement and must make the second block unless he has no further normal movement and cannot go for it again.  ", "title": "Frenzy", "id": "frenzy"}, "loner": {"category": "extraordinary", "text": "Loners, through inexperience, arrogance, animal ferocity or just plain stupidity, do not work well with the rest of the team. As a result, a Loner may use team re-rolls but has to roll a D6 first. On a roll of 4+, he may use the team re-roll as normal. On a roll of 1-3 the original result stands without being re-rolled but the team re-roll is lost (i.e. used).  ", "title": "Loner", "id": "loner"}, "big-hand": {"category": "mutation", "text": "One of the player's hands has grown monstrously large, yet remained completely functional. The player ignores modifier(s) for enemy tackle zones or Pouring Rain weather when he attempts to pick up the ball.  ", "title": "Big Hand", "id": "big-hand"}, "dauntless": {"category": "general", "text": "A player with this skill is capable of psyching themselves up so that they can take on even the very strongest opponent. The skill only works when the player attempts to block an opponent who is stronger than himself. When the skill is used, the coach of the player with the Dauntless skill rolls a D6 and adds it to his strength. If the total is equal to or lower than the opponent's Strength, the player must block using his normal Strength. If the total is greater, then the player with the Dauntless skill counts as having a Strength equal to his opponent's when he makes the block. The strength of both players is calculated before any defensive or offensive assists are added but after all other modifiers.  ", "title": "Dauntless", "id": "dauntless"}, "nurgle's-rot": {"category": "extraordinary", "text": "This player has a horrible infectious disease which spreads when he kills an opponent during a Block, Blitz or Foul Action. Instead of truly dying, the infected opponent becomes a new rookie Rotter. To do so, the opponent must have been removed from the roster during step 2.1 of the Post-game sequence, his Strength cannot exceed 4, and he cannot have the Decay, Regeneration or Stunty skills. The new Rotter can be added to the Nurgle team for free during step 5 of Updating Your Team Roster (see page 29) if the team has an open Roster slot. This new Rotter still counts at full value towards the total value of the Nurgle team.  ", "title": "Nurgle's Rot", "id": "nurgle's-rot"}, "guard": {"category": "strength", "text": "A player with this skill assists an offensive or defensive block even if he is in another player's tackle zone. This skill may not be used to assist a foul.  ", "title": "Guard", "id": "guard"}, "multiple-block": {"category": "strength", "text": "At the start of a Block Action a player who is adjacent to at least two opponents may choose to throw blocks against two of them. Make each block in turn as normal except that each defender's strength is increased by 2. The player cannot follow up either block when using this skill, so Multiple Block can be used instead of Frenzy, but both skills cannot be used together. To have the option to throw the second block the player must still be on his feet after the first block.  ", "title": "Multiple Block", "id": "multiple-block"}, "juggernaut": {"category": "strength", "text": "A player with this skill is virtually impossible to stop once he is in motion. If this player takes a Blitz Action, then opposing players may not use their Fend, Stand Firm or Wrestle skills against blocks, and he may choose to treat a 'Both Down' result as if a 'Pushed' result has been rolled instead.  ", "title": "Juggernaut", "id": "juggernaut"}, "two-heads": {"category": "mutation", "text": "Having two heads enables this player to watch where he is going and the opponent trying to make sure he does not get there at the same time. Add 1 to all Dodge rolls the player makes. ", "title": "Two Heads", "id": "two-heads"}, "foul-appearance": {"category": "mutation", "text": "The player's appearance is so horrible that any opposing player that wants to block the player (or use a special attack that takes the place of a block) must first roll a D6 and score 2 or more. If the opposing player rolls a 1 he is too revolted to make the block and it is wasted (though the opposing team does not suffer a turnover).  ", "title": "Foul Appearance", "id": "foul-appearance"}, "catch": {"category": "agility", "text": "A player who has the Catch skill is allowed to re-roll the D6 if he fails a catch roll. It also allows the player to re-roll the D6 if he drops a hand-off or fails to make an interception.  ", "title": "Catch", "id": "catch"}, "grab": {"category": "strength", "text": "A player with this skill uses his great strength and prowess to grab his opponent and throw him around. To represent this, only while making a Block Action, if his block results in a push back he may choose any empty square adjacent to his opponent to push back his opponent. When making a Block or Blitz Action, Grab and Side Step will cancel each other out and the standard pushback rules apply. Grab will not work if there are no empty adjacent squares. A player with the Grab skill can never learn or gain the Frenzy skill through any means. Likewise, a player with the Frenzy skill can never learn or gain the Grab skill through any means.  ", "title": "Grab", "id": "grab"}, "strip-ball": {"category": "general", "text": "When a player with this skill blocks an opponent with the ball, applying a 'Pushed' or 'Defender Stumbles' result will cause the opposing player to drop the ball in the square that they are pushed to, even if the opposing player is not Knocked Down.  ", "title": "Strip Ball", "id": "strip-ball"}, "bone-head": {"category": "extraordinary", "text": "The player is not noted for his intelligence. Because of this you must roll a D6 immediately after declaring an Action for the player, but before taking the Action. On a roll of 1 they stand around trying to remember what it is they're meant to be doing. The player can't do anything for the turn, and the player's team loses the declared Action for the turn. (So if a Bone-head player declares a Blitz Action and rolls a 1, then the team cannot declare another Blitz Action that turn.) The player loses his tackle zones and may not catch, intercept or pass, assist another player on a block or foul, or voluntarily move until he manages to roll a 2 or better at the start of a future Action or the drive ends.  ", "title": "Bone-head", "id": "bone-head"}, "side-step": {"category": "agility", "text": "A player with this skill is an expert at stepping neatly out of the way of an attacker. To represent this ability, his coach may choose which square the player is moved to when he is pushed back, rather than the opposing coach. Furthermore, the coach may choose to move the player to any adjacent square, not just the three squares shown on the Push Back diagram. Note that the player may not use this skill if there are no open squares on the pitch adjacent to this player. Note that the coach may choose which square the player is moved to even if the player is Knocked Down after the push back.  ", "title": "Side Step", "id": "side-step"}, "stunty": {"category": "extraordinary", "text": "The player is so small that they are very difficult to tackle because they can duck underneath opposing players' outstretched arms and run between their legs. On the other hand, Stunty players are just a bit too small to throw the ball very well, and are easily injured. To represent these things a player with the Stunty skill may ignore any enemy tackle zones on the square he is moving to when he makes a Dodge roll (i.e., they always end up with a +1 Dodge roll modifier), but must subtract 1 from the roll when they pass. In addition, this player treats a roll of 7 and 9 on the Injury table after any modifiers have been applied as a KO'd and Badly Hurt result respectively rather than the normal results. Stunties that are armed with a Secret Weapon are not allowed to ignore enemy tackle zones, but still suffer the other penalties. ", "title": "Stunty", "id": "stunty"}, "diving-tackle": {"category": "agility", "text": "The player may use this skill after an opposing player attempts to dodge out of any of his tackle zones. The player using this skill is Placed Prone in the square vacated by the dodging player, but do not make an Armour or Injury roll for them. The opposing player must then subtract 2 from his Dodge roll for leaving the player's tackle zone. If a player is attempting to leave the tackle zone of several players that have the Diving Tackle skill, then only one of the opposing players may use Diving Tackle. Diving Tackle may be used on a re-rolled dodge if not declared for use on the first Dodge roll. Once the dodge is resolved but before any armour roll for the opponent (if needed), the Diving Tackle Player is Placed Prone in the square vacated by the dodging player but do not make an Armour or Injury roll for the Diving Tackle player.  ", "title": "Diving Tackle", "id": "diving-tackle"}, "tackle": {"category": "general", "text": "Opposing players who are standing in any of this player's tackle zones are not allowed to use their Dodge skill if they attempt to dodge out of any of the player's tackle zones, nor may they use their Dodge skill if the player throws a block at them and uses the Tackle skill.  ", "title": "Tackle", "id": "tackle"}, "dodge": {"category": "agility", "text": "A player with the Dodge skill is adept at slipping away from opponents, and is allowed to re-roll the D6 if he fails to dodge out of any of an opposing player's tackle zones. However, the player may only re-roll one failed Dodge roll per turn. In addition, the Dodge skill, if used, affects the results rolled on the Block dice, as explained in the Blocking rules in the Blood Bowl book.  ", "title": "Dodge", "id": "dodge"}, "extra-arms": {"category": "mutation", "text": "A player with one or more extra arms may add 1 to any attempt to pick up, catch or intercept.  ", "title": "Extra Arms", "id": "extra-arms"}, "dump-off": {"category": "passing", "text": "This skill allows the player to make a Quick Pass when an opponent declares that he will throw a block at him, allowing the player to get rid of the ball before he is hit. Work out the Dump-Off pass before the opponent makes his block. The normal throwing rules apply, except that neither team's turn ends as a result of the throw, whatever it may be. After the throw is worked out your opponent completes the block, and then carries on with his turn. Dump-Off may not be used on the second block from an opponent with the Frenzy skill or in conjunction with the Bombardier or Throw Team-Mate skills.  ", "title": "Dump-Off", "id": "dump-off"}, "tentacles": {"category": "mutation", "text": "The player may attempt to use this skill when an opposing player attempts to dodge or leap out of any of his tackle zones. The opposing player rolls 2D6 adding their own player's ST and subtracting the Tentacles player's ST from the score. If the final result is 5 or less, then the moving player is held firm, and his action ends immediately. If a player attempts to leave the tackle zone of several players that have the Tentacles ability, then only one of the opposing players may attempt to grab him with the tentacles.  ", "title": "Tentacles", "id": "tentacles"}, "diving-catch": {"category": "agility", "text": "The player is superb at diving to catch balls others cannot reach and jumping to more easily catch perfect passes. The player may add 1 to any catch roll from an accurate pass targeted to his square. In addition, the player can attempt to catch any pass, kick off or crowd throw-in, but not bouncing ball, that would land in an empty square in one of his tackle zones as if it had landed in his own square without leaving his current square. A failed catch will bounce from the Diving Catch player's square. If there are two or more players attempting to use this skill then they get in each other's way and neither can use it.  ", "title": "Diving Catch", "id": "diving-catch"}, "leader": {"category": "passing", "text": "The player is a natural leader and commands the rest of the team from the back-field as he prepares to throw the ball. A team with one or more players with the Leader skill may take a single Leader Re-roll counter and add it to their team re-rolls at the start of the game and at half time after any Master Chef rolls. The Leader re-roll is used exactly the same in every way as a normal Team re-roll with all the same restrictions. In addition, the Leader re-roll may only be used so long as at least one player with the Leader skill is on the pitch - even if they are Prone or Stunned! Rerolls from Leader may be carried over into Overtime if not used, but the team does not receive a new Leader re-roll at the start of Overtime.  ", "title": "Leader", "id": "leader"}, "hail-mary-pass": {"category": "passing", "text": "The player may throw the ball to any square on the playing pitch, no matter what the range: the range ruler is not used. Roll a D6. On a roll of 1 the player fumbles the throw, and the ball will bounce once from the thrower's square. On a roll of 2-6 the player may make the pass. The Hail Mary pass may not be intercepted, but it is never accurate - the ball automatically misses and scatters three squares. Note that if you are lucky, the ball will scatter back into the target square! This skill may not be used in a blizzard or with the Throw Team-Mate skill.  ", "title": "Hail Mary Pass", "id": "hail-mary-pass"}, "always-hungry": {"category": "extraordinary", "text": "The player is always ravenously hungry - and what's more they'll eat absolutely anything! Should the player ever use the Throw Team-Mate skill, roll a D6 after he has finished moving, but before he throws his team-mate. On a 2+ continue with the throw. On a roll of 1 he attempts to eat the unfortunate team-mate! Roll the D6 again, a second 1 means that he successfully scoffs the team-mate down, which kills the team-mate without opportunity for recovery (Apothecaries, Regeneration or anything else cannot be used). If the team-mate had the ball it will scatter once from the team-mate's square. If the second roll is 2-6 the team-mate squirms free and the Pass Action is automatically treated as a fumbled pass. Fumble the player with the Right Stuff skill as normal.  ", "title": "Always Hungry", "id": "always-hungry"}, "hypnotic-gaze": {"category": "extraordinary", "text": "The player has a powerful telepathic ability that he can use to stun an opponent into immobility. The player may use hypnotic gaze at the end of his Move Action on one opposing player who is in an adjacent square. Make an Agility roll for the player with hypnotic gaze, with a -1 modifier for each opposing tackle zone on the player with hypnotic gaze other than the victim's. If the Agility roll is successful, then the opposing player loses his tackle zones and may not catch, intercept or pass the ball, assist another player on a block or foul, or move voluntarily until the start of his next action or the drive ends. If the roll fails, then the hypnotic gaze has no effect.  ", "title": "Hypnotic Gaze", "id": "hypnotic-gaze"}, "pass": {"category": "passing", "text": "A player with the Pass skill is allowed to re-roll the D6 if he throws an inaccurate pass or fumbles.  ", "title": "Pass", "id": "pass"}, "wrestle": {"category": "general", "text": "The player is specially trained in grappling techniques. This player may use Wrestle when he blocks or is blocked and a 'Both Down' result on the Block dice is chosen by either coach. Instead of applying the 'Both Down' result, both players are wrestled to the ground. Both players are Placed Prone in their respective squares even if one or both have the Block skill. Do not make Armour rolls for either player. Use of this skill does not cause a turnover unless the active player was holding the ball.  ", "title": "Wrestle", "id": "wrestle"}, "really-stupid": {"category": "extraordinary", "text": "This player is without doubt one of the dimmest creatures to ever take to a Blood Bowl pitch (which considering the IQ of most other players, is really saying something!). Because of this you must roll a D6 immediately after declaring an Action for the player, but before taking the Action. If there are one or more players from the same team standing adjacent to the Really Stupid player's square, and who aren't Really Stupid, then add 2 to the D6 roll. On a result of 1-3 they stand around trying to remember what it is they're meant to be doing. The player can't do anything for the turn, and the player's team loses the declared Action for that turn (for example if a Really Stupid player declares a Blitz Action and fails the Really Stupid roll, then the team cannot declare another Blitz Action that turn). The player loses his tackle zones and may not catch, intercept or pass the ball, assist another player on a block or foul, or voluntarily move until he manages to roll a successful result for a Really Stupid roll at the start of a future Action or the drive ends.  ", "title": "Really Stupid", "id": "really-stupid"}, "no-hands": {"category": "extraordinary", "text": "The player is unable to pick up, intercept or carry the ball and will fail any catch roll automatically, either because he literally has no hands or because his hands are full. If he attempts to pick up the ball then it will bounce, and will causes a turnover if it is his team's turn.  ", "title": "No Hands", "id": "no-hands"}, "horns": {"category": "mutation", "text": "A player with Horns may use them to butt an opponent. Horns adds 1 to the player's Strength for any block(s) he makes during a Blitz Action.  ", "title": "Horns", "id": "horns"}, "animosity": {"category": "extraordinary", "text": "A player with this skill does not like players from his team that are a different race than he is and will often refuse to play with them despite the coach's orders. If this player at the end of his Hand-off or Pass Action attempts to hand-off or pass the ball to a team-mate that is not the same race as the Animosity player, roll a D6. On a 2+, the pass/hand-off is carried out as normal. On a 1, the player refuses to try to give the ball to any team-mate except one of his own race. The coach may choose to change the target of the pass/hand-off to another team-mate of the same race as the Animosity player, however no more movement is allowed for the Animosity player, so the current Action may be lost for the turn.  ", "title": "Animosity", "id": "animosity"}, "bombardier": {"category": "extraordinary", "text": "A coach may choose to have a Bombardier who is not Prone or Stunned throw a bomb instead of taking any other Action with the player. This does not use the team's Pass Action for the turn. The bomb is thrown using the rules for throwing the ball (including weather effects and use of Hail Mary Pass), except that the player may not move or stand up before throwing it (he needs time to light the fuse!). Intercepted bomb passes are not turnovers. Fumbles or any bomb explosions that lead to a player on the active team being knocked over are turnovers. All skills that may be used when a ball is thrown may be used when a bomb is thrown also. A bomb may be intercepted or caught using the same rules for catching the ball, in which case the player catching it must throw it again immediately. This is a special bonus Action that takes place out of the normal sequence of play. A player holding the ball can catch or intercept and throw a bomb. The bomb explodes when it lands in an empty square or an opportunity to catch the bomb fails or is declined (i.e., bombs don't 'bounce'). If the bomb is fumbled it explodes in the bomb thrower's square. If a bomb lands in the crowd, it explodes with no effect. When the bomb finally does explode any player in the same square is Knocked Down, and players in adjacent squares are Knocked Down on a roll of 4+. Players can be hit by a bomb and treated as Knocked Down even if they are already Prone or Stunned. Make Armour and Injury rolls for any players Knocked Down by the bomb. Casualties caused by a bomb do not count for Star Player points.  ", "title": "Bombardier", "id": "bombardier"}, "take-root": {"category": "extraordinary", "text": "Immediately after declaring an Action with this player, roll a D6. On a 2 or more, the player may take his Action as normal. On a 1, the player \"takes root\", and his MA is considered 0 until a drive ends, or he is Knocked Down or Placed Prone (and no, players from his own team may not try and block him in order to try to knock him down!). A player that has taken root may not Go For It, be pushed back for any reason, or use any skill that would allow him to move out of his current square or be Placed Prone. The player may block adjacent players without following-up as part of a Block Action however if a player fails his Take Root roll as part of a Blitz Action he may not block that turn (he can still roll to stand up if he is Prone).  ", "title": "Take Root", "id": "take-root"}, "very-long-legs": {"category": "mutation", "text": "The player is allowed to add 1 to the D6 roll whenever he attempts to intercept or uses the Leap skill. In addition, the Safe Throw skill may not be used to affect any Interception rolls made by this player. ", "title": "Very Long Legs", "id": "very-long-legs"}, "safe-throw": {"category": "passing", "text": "This player is an expert at throwing the ball in a way so as to make it even more difficult for any opponent to intercept it. If a pass made by this player is ever intercepted then the Safe Throw player may make an unmodified Agility roll. If this is successful then the interception is cancelled out and the passing sequence continues as normal. In addition if this player fumbles a pass on any roll other than a natural 1 then he manages to keep hold of the ball instead of suffering a fumble and the team does not suffer a turnover. ", "title": "Safe Throw", "id": "safe-throw"}, "kick": {"category": "general", "text": "The player is an expert at kicking the ball and can place the kick with great precision. In order to use this skill the player must be set up on the pitch when his team kicks off. The player may not be set up in either wide zone or on the line of scrimmage. Only if all these conditions are met is the player then allowed to take the kick-off. Because his kick is so accurate, you may choose to halve the number of squares that the ball scatters on kick-off, rounding any fractions down (i.e., 1 = 0, 2-3 = 1, 4-5 = 2, 6 = 3).  ", "title": "Kick", "id": "kick"}, "right-stuff": {"category": "extraordinary", "text": "A player with the Right Stuff skill can be thrown by another player from his team who has the Throw Team-Mate skill. See the Throw Team-Mate skill entry below for details of how the player is thrown. When a player with this skill is thrown or fumbled and ends up in an unoccupied square, he must make a landing roll unless he landed on another player during the throw. A landing roll is an Agility roll with a -1 modifier for each opposing player's tackle zone on the square he lands in. If he passes the roll he lands on his feet. If the landing roll is failed or he landed on another player during the throw he is Placed Prone and must pass an Armour roll to avoid injury. If the player is not injured during his landing he may take an Action later this turn if he has not already done so. A failed landing roll or landing in the crowd does not cause a turnover, unless he was holding the ball. ", "title": "Right Stuff", "id": "right-stuff"}, "fend": {"category": "general", "text": "This player is very skilled at holding off would-be attackers. Opposing players may not follow-up blocks made against this player even if the Fend player is Knocked Down. The opposing player may still continue moving after blocking if he had declared a Blitz Action.  ", "title": "Fend", "id": "fend"}, "sprint": {"category": "agility", "text": "The player may attempt to move up to three extra squares rather than the normal two when Going For It (see page 20). His coach must still roll to see if the player is Knocked Down in each extra square he enters.  ", "title": "Sprint", "id": "sprint"}, "ball-&-chain": {"category": "extraordinary", "text": "Players armed with a Ball & Chain can only take Move Actions. To move or Go For It, place the throw-in template over the player facing up or down the pitch or towards either sideline. Then roll a D6 and move the player one square in the indicated direction; no Dodge roll is required if you leave a tackle zone. If this movement takes the player off the pitch, they are beaten up by the crowd in the same manner as a player who has been pushed off the pitch. Repeat this process for each and every square of normal movement the player has. You may then GFI using the same process if you wish. If during his Move Action he would move into an occupied square then the player will throw a block following normal blocking rules against whoever is in that square, friend or foe (and it even ignores Foul Appearance!). Prone or Stunned players in an occupied square are pushed back and an Armour roll is made to see if they are injured, instead of the block being thrown at them. The player must follow up if they push back another player, and will then carry on with their move as described above. If the player is ever Knocked Down or Placed Prone roll immediately for injury (no Armour roll is required). Stunned results for any Injury rolls for the Ball & Chain player are always treated as KO'd. A Ball & Chain player may use the Grab skill (as if a Block Action was being used) with his blocks (if he has learned it!). A Ball & Chain player may never use the Diving Tackle, Frenzy, Kick-Off Return, Leap, Pass Block or Shadowing skills.  ", "title": "Ball & Chain", "id": "ball-&-chain"}, "stab": {"category": "extraordinary", "text": "A player with this skill is armed with something very good at stabbing, slashing or hacking up an opponent, like sharp fangs or a trusty dagger. This player may attack an opponent with their stabbing attack instead of throwing a block at them. Make an unmodified Armour roll (except for Stakes) for the victim. If the score is less than or equal to the victim's Armour value then the attack has no effect. If the score beats the victim's Armour value then they have been wounded and an Injury roll must be made. This Injury roll should ignore all modifiers from any source - including Niggling injuries. If Stab is used as part of a Blitz Action, the player cannot continue moving after using it. Casualties caused by a stabbing attack do not count for Star Player points ", "title": "Stab", "id": "stab"}, "kick-off-return": {"category": "general", "text": "A player on the receiving team that is not on the Line of Scrimmage or in an opposing tackle zone may use this skill when the ball has been kicked. It allows the player to move up to 3 squares after the ball has been scattered but before rolling on the Kick-Off table. Only one player may use this skill each kick-off. This skill may not be used for a touchback kick-off and does not allow the player to cross into the opponent's half of the pitch.  ", "title": "Kick-Off Return", "id": "kick-off-return"}, "fan-favourite": {"category": "extraordinary", "text": "The fans love seeing this player on the pitch so much that even the opposing fans cheer for your team. For each player with Fan Favourite on the pitch your team receives an additional +1 FAME modifier (see page 18) for any Kick-Off table results, but not for the Winnings roll.  ", "title": "Fan Favourite", "id": "fan-favourite"}, "blood-lust": {"category": "extraordinary", "text": "Vampires must occasionally feed on the blood of the living. Immediately after declaring an Action with a Vampire, roll a d6: On a 2+ the Vampire can carry out the Action as normal. On a 1, however, the Vampire must feed on a Thrall team-mate or a spectator. The Vampire may continue with his declared Action or if he had declared a Block Action, he may take a Move Action instead. Either way, at the end of the declared Action, but before actually passing, handing off, or scoring, the vampire must feed. If he is standing adjacent to one or more Thrall team-mates (standing, prone or stunned), then choose one to bite and make an Injury roll on the Thrall treating any casualty roll as Badly Hurt. The injury will not cause a turnover unless the Thrall was holding the ball. Once the Vampire has bitten a Thrall he may complete his Action. Failure to bite a Thrall is a turnover and requires you to feed on a spectator - move the Vampire to the reserves box if he was still on the pitch. If he was holding the ball, it bounces from the square he occupied when he was removed and he will not score a touchdown if he was in the opposing end zone.  ", "title": "Blood Lust", "id": "blood-lust"}, "pass-block": {"category": "general", "text": "A player with this skill is allowed to move up to three squares when the opposing coach announces that one of his players is going to pass the ball (but not a bomb). The opposing coach may not change his mind about passing once Pass Block's use is declared. The move is made out of sequence, after the range has been measured, but before any interception attempts have been made. A player may not make the move unless able to reach a legal destination and may not follow a route that would not allow them to reach a legal destination. A legal destination puts the player in a position to attempt an interception, an empty square that is the target of the pass, or with his tackle zone on the thrower or catcher. The player may not stop moving until he has reached a legal destination, has been held fast by Tentacles or has been Knocked Down. The special move is free, and in no way affects the player's ability to move in a subsequent action. The move is made using all of the normal rules and skills and the player does have to dodge in order to leave opposing players' tackle zones. Players with Pass Block may use this skill against a Dump Off pass. If a player performing a Pass Block in their own turn is Knocked Down then this is a turnover, no other players may perform Pass Block moves, and your turn ends as soon as the results of the pass and the block are resolved.  ", "title": "Pass Block", "id": "pass-block"}, "nerves-of-steel": {"category": "passing", "text": "The player ignores modifiers for enemy tackle zones when he attempts to pass, catch or intercept.  ", "title": "Nerves of Steel", "id": "nerves-of-steel"}, "piling-on": {"category": "strength", "text": "The player may use this skill after he has made a block as part of one of his Block or Blitz Actions, but only if the Piling On player is currently standing adjacent to the victim and the victim was Knocked Down. You may re-roll the Armour roll or Injury roll for the victim. The Piling On player is Placed Prone in his own square -- it is assumed that he rolls back there after flattening his opponent (do not make an Armour roll for him as he has been cushioned by the other player!). Piling On does not cause a turnover unless the Piling On player is carrying the ball. Piling On cannot be used with the Stab or Chainsaw skills.  ", "title": "Piling On", "id": "piling-on"}};
    
    var innerString = function(el) {
        if (el) {
            return el.textContent || el.innerText;
        }
        return "";
    };

    function getStyle(el, styleProp) {
        var value, defaultView = (el.ownerDocument || document).defaultView;
        // W3C standard way:
        if (defaultView && defaultView.getComputedStyle) {
            // sanitize property name to css notation
            // (hypen separated words eg. font-Size)
            styleProp = styleProp.replace(/([A-Z])/g, "-$1").toLowerCase();
            return defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
        } else if (el.currentStyle) { // IE
            // sanitize property name to camelCase
            styleProp = styleProp.replace(/\-(\w)/g, function(str, letter) {
                return letter.toUpperCase();
            });
            value = el.currentStyle[styleProp];
            // convert other units to pixels on IE
            if (/^\d+(em|pt|%|ex)?$/i.test(value)) { 
                return (function(value) {
                    var oldLeft = el.style.left, oldRsLeft = el.runtimeStyle.left;
                    el.runtimeStyle.left = el.currentStyle.left;
                    el.style.left = value || 0;
                    value = el.style.pixelLeft + "px";
                    el.style.left = oldLeft;
                    el.runtimeStyle.left = oldRsLeft;
                    return value;
                })(value);
            }
            return value;
        }
    }

    function hasClass( target, className ) {
        return new RegExp('(\\s|^)' + className + '(\\s|$)').test(target.className);
    }
    var heartbeat = function (){
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", "http://www.anarchy.bloodbowlleague.com/default.asp?p=adm", false );
        xmlHttp.send( null );
    };

    var wrapAnchor = function(el, link, title) {
        var tooltip = "";
        if( title && title.length > 0 ) {
            tooltip = title;
        }

        var text = el.innerHTML;
        el.innerHTML = "<a class='player-link' style='text-decoration: none; cursor: pointer;' href='"+link+"' title='"+tooltip+"'>"+text+"</a>";
        return el;
    };

    var extractLink = function(el) {
        if (! el ) {
            return "#feilExtractLink";
        }
        return el.onclick.toString().match(/\'.*.*\'/g).toString().slice(1,-1);


    };

    var processTdOnClick = function(td) {
        if(! td.hasAttribute("onclick")) {
            alert("I find your lack of onclick disturbing");
        }
        var onclick = td.getAttribute("onclick").toString();
        if(onclick.indexOf("gototeam") > -1 ) {
            if( (td.style.color=="rgb(32, 48, 64)" || td.style.color=="rgb(96, 96, 96)")) {
                var teamId = extractLink(td);
                var innerHtml = td.innerHTML;
                td.innerHTML = "";
                var a = document.createElement("a");

                td.appendChild(a);

                var tooltip ="open team info";
                var whereTo = "tm";
                if(hasClass(td,"td10")) {
                    whereTo = "ro";
                    tooltip = "open roster";
                }
                a.setAttribute("href", "/default.asp?p="+whereTo+"&t=" + teamId);
                if(tooltip.length > 0 ) {
                    a.setAttribute("title", tooltip);
                }
                a.innerHTML = innerHtml;
                a.style.cursor="pointer";
                td.appendChild(a);
            }

            td.removeAttribute("onclick");
            td.style.cursor = "default";
        }
        return "";

    };

    var processTrOnClick = function(el) {
        var link = extractLink(el);
        var td = el.querySelectorAll("td");

        for(var j = 0; j < td.length; j++) {
            wrapAnchor(td[j], link);

        }



    };

    var processMenuTd = function(el) {
        //alert(el.getAttribute("onclick"));
        var link = extractLink(el);
        //alert(link);
        wrapAnchor(el, link);  
        el.setAttribute("onclick", "");
    };


    // CONVERT onclicks to link
    var tr_onclicks = document.querySelectorAll("tr[onclick]");
    for(var i = 0; i < tr_onclicks.length; i++) {
        processTrOnClick(tr_onclicks[i]);
        tr_onclicks[i].onclick="";
        tr_onclicks[i].style.cursor="default";
    }

    var td_onclicks = document.querySelectorAll("td[onclick]");
    for(var q = 0; q < td_onclicks.length; q++) {
        processTdOnClick(td_onclicks[q]);
    }


    td_onclicks = document.querySelectorAll("td.menu");
    for(q = 0; q < td_onclicks.length; q++) {
        var menuTd = td_onclicks[q];
        if(menuTd.hasAttribute("onclick")) {
            processMenuTd(menuTd);
        }
    }

    var applyDropdownFilter = function (element) {
        element.dropdown.innerHTML = "";
        for(var j = 0; j < element.options.length; j++) {
            //console.log(this.options[j].name);
            if((element.value.length == 0) || element.options[j].name.search(new RegExp(element.value,"i")) >=0) {
                var foo = document.createElement("option");
                foo.value = element.options[j].id;
                foo.innerHTML = element.options[j].name;

                element.dropdown.appendChild(foo);
            }

        }  
    };

    var findTeamRoster = function() {
        var roster = document.querySelector("table tbody tr td.small + td + td");

        if(innerString(roster).endsWith("Player name")) {
            return roster.parentNode.parentNode.parentNode;
        }
        return false;

    };

    var rowIsAPlayer = function(row) {
        //If the first column contain a number
        var firstColumn = innerString(row.querySelector("td a"));
        return !isNaN(parseFloat(firstColumn)) && isFinite(firstColumn);
    };

    var addClassToElement = function(el, clazz){
        var currentClass = el.getAttribute("Class") || "";
        el.setAttribute("class", (currentClass +" "+clazz).trim());
    };

    var decoratePlayer = function(player) {
        addClassToElement(player, "player");

        var playerColumn = player.querySelectorAll("td").values();

        addClassToElement(playerColumn.next().value, "player-number");
        playerColumn.next(); //empty
        addClassToElement(playerColumn.next().value,"player-name");

        addClassToElement(playerColumn.next().value, "player-ma");
        addClassToElement(playerColumn.next().value, "player-st");
        addClassToElement(playerColumn.next().value, "player-ag");
        addClassToElement(playerColumn.next().value, "player-av");

        addClassToElement(playerColumn.next().value, "player-skills");

        addClassToElement(playerColumn.next().value, "player-mng");
        addClassToElement(playerColumn.next().value,"player-niggle");

        addClassToElement(playerColumn.next().value,"player-int");
        addClassToElement(playerColumn.next().value,"player-comp");
        addClassToElement(playerColumn.next().value,"player-td");
        addClassToElement(playerColumn.next().value,"player-cas");
        addClassToElement(playerColumn.next().value,"player-mvp");
        addClassToElement(playerColumn.next().value,"player-spp");
        addClassToElement(playerColumn.next().value,"player-value");


    };

    var addRosterClass = function(roster) {
        var row = roster.querySelectorAll("tbody tr");

        for(var i = 0; i < row.length; i++) {
            if(rowIsAPlayer(row[i])) {
                decoratePlayer(row[i]);
            }

        }

    };

    var decorateTeamRoster = function() {
        var roster = findTeamRoster();
        if(! roster ) {
            return;
        }

        addRosterClass(roster);


    };
    var updateDropdown = function(event, el) {
        var time = new Date().getTime();
        console.log("Søk:"+this.value + ":" +this.dropdown.options.length);

        if(event.keyCode == 38 ) {
            //up   
            var index = this.dropdown.selectedIndex;
            if(index > 0 ) {
                this.dropdown.selectedIndex = index -1;
            }

        }else if (event.keyCode == 40 ) {
            //down    
            var index = this.dropdown.selectedIndex;
            if(index < this.dropdown.length -1 ) {
                this.dropdown.selectedIndex =index +1;
            }



        }else {
            applyDropdownFilter(this);
        }

        console.log(event.keyCode + " " +this.value +" Added " + this.dropdown.size + " in " + (new Date().getTime() - time)+ "ms");

    };

    var addDropdownSearch = function(name) {
        var targets = document.getElementsByName(name);

        for(var i=0; i < targets.length; i++) {
            var target = targets[i];
            var targetWidth =  getStyle(target, "width");

            var dropdownSearch = document.createElement("input");
            //target.setAttribute("onchange", "");
            dropdownSearch.dropdown = target;
            dropdownSearch.setAttribute("class", "dropdown-search");
            target.width = targetWidth;
            dropdownSearch.style.width = targetWidth;
            dropdownSearch.type="text";
            dropdownSearch.addEventListener("keyup", updateDropdown);

            dropdownSearch.options = [];
            var previousId = 0;
            for(var j=0; j < target.childNodes.length; j++) {
                var option = target.childNodes[j];
                //console.log(option);
                if("OPTION" == target.childNodes[j].tagName && target.childNodes[j].value !== previousId) {
                    //console.log(target.childNodes[j].tagName +  "::" + target.childNodes[j].value+ "::" + previousId);
                    previousId = target.childNodes[j].value;
                    var name = option.textContent || target.childNodes[j].innerText;
                    var player = {"id": target.childNodes[j].value, "name":name};
                    dropdownSearch.options.push( player );
                }

            }
            target.parentNode.insertBefore(dropdownSearch, target);
            applyDropdownFilter(dropdownSearch);
            console.log("//onchange:"+target.getAttribute("onchange"));
        }
    };

    addDropdownSearch("bountyspiller");
    addDropdownSearch("m0team1"); 
    addDropdownSearch("m0team2");


    //Remove javascript log out
    var timer_id = window.setTimeout(function() {}, 0);
    while (timer_id--) {
        window.clearTimeout(timer_id); // will do nothing if no timeout with id is present
    }

    decorateTeamRoster();


    //Keep alive
    window.setInterval(heartbeat, 600000);

})();
