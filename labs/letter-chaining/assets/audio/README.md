# Audio clips

Every letter sound, word, keyword picture, and sentence in Letter Chains plays from a file in this
folder. The page never uses the computer's built-in voice when a file is here, so it sounds the same
on every computer and browser. When a teacher records a letter sound or word in Teacher Corner, their recording plays instead.

**These files are computer-generated** with the "Heart" voice of Kokoro-82M, an open-source voice
model, by the site's `tools/voice/letter_chains.py`. Words, keywords and letter sounds were made from exact phonemes,
and every take was checked automatically for phoneme errors before the best one was kept. `tools/voice/README.md` explains
the method.

Heart's short i and short e are close together. Measured across all the words they stay apart, but before n, g,
l and ng a few pairs come out close (pin and pen, sing and seng), and new takes don't change that. If a clip
sounds wrong for a class, a teacher recording replaces it.

## Replacing a clip

- Save it as a mono MP3 with the exact file name below: 128 kbps for letter sounds, 96 kbps for
  everything else. Delete any WAV of the same name.
- Then run `node tools/build-audio.js` to rebuild the `.js` file the page loads. The lab's
  `test/audio.test.js` checks the names, format and bitrates.
- Each tile says one sound in every word. Short o is always the open "ah" of dot, so dog is "dahg"
  and ton is "tahn". C and g are always hard: "cit" is /k/ /ĭ/ /t/, not "sit". Th is the th of thumb.
- Letter sounds are just the sound, with no "uh": /t/ not "tuh", and /n/ is a short hum.
- Trim silence at the start and end, and keep levels even between clips.

## Letter sounds (41)

Tiles that say the same sound share a clip.

| File | Say | Tiles |
| --- | --- | --- |
| `sounds/a.mp3` | /ă/ as in apple | a |
| `sounds/e.mp3` | /ĕ/ as in egg | e |
| `sounds/i.mp3` | /ĭ/ as in igloo | i |
| `sounds/o.mp3` | /ŏ/ as in octopus ("ah") | o |
| `sounds/u.mp3` | /ŭ/ as in umbrella | u |
| `sounds/b.mp3` | /b/ | b |
| `sounds/c.mp3` | /k/ | c, k, ck |
| `sounds/d.mp3` | /d/ | d |
| `sounds/f.mp3` | /f/ | f |
| `sounds/g.mp3` | /g/ (hard, as in goat) | g |
| `sounds/h.mp3` | /h/ | h |
| `sounds/j.mp3` | /j/ | j |
| `sounds/l.mp3` | /l/ | l |
| `sounds/m.mp3` | /m/ | m |
| `sounds/n.mp3` | /n/ | n |
| `sounds/p.mp3` | /p/ | p |
| `sounds/qu.mp3` | /kw/ | qu |
| `sounds/r.mp3` | /r/ | r |
| `sounds/s.mp3` | /s/ | s |
| `sounds/t.mp3` | /t/ | t |
| `sounds/v.mp3` | /v/ | v |
| `sounds/w.mp3` | /w/ | w, wh |
| `sounds/x.mp3` | /ks/ | x |
| `sounds/y.mp3` | /y/ as in yarn | y |
| `sounds/z.mp3` | /z/ | z |
| `sounds/sh.mp3` | /sh/ | sh |
| `sounds/ch.mp3` | /ch/ | ch |
| `sounds/th.mp3` | /th/ as in thumb | th |
| `sounds/ng.mp3` | /ng/ as in ring | ng |
| `sounds/nk.mp3` | /ngk/ as in skunk | nk |
| `sounds/ai.mp3` | long a, as in rain | ai, ay, a_e |
| `sounds/ee.mp3` | long e, as in bee | ee, ea |
| `sounds/oa.mp3` | long o, as in boat | oa, o_e |
| `sounds/igh.mp3` | long i, as in light | igh, i_e |
| `sounds/u_e.mp3` | long u, as in cube | u_e |
| `sounds/oo.mp3` | /oo/ as in moon | oo |
| `sounds/ow.mp3` | /ow/ as in cow | ow, ou |
| `sounds/oi.mp3` | /oy/ as in oil | oi, oy |
| `sounds/ar.mp3` | /ar/ as in car | ar |
| `sounds/or.mp3` | /or/ as in corn | or |
| `sounds/er.mp3` | /er/ as in tiger | er, ir, ur |

## Keyword pictures (53)

| File | Keyword for |
| --- | --- |
| `keywords/apple.mp3` | a |
| `keywords/egg.mp3` | e |
| `keywords/igloo.mp3` | i |
| `keywords/octopus.mp3` | o |
| `keywords/umbrella.mp3` | u |
| `keywords/bus.mp3` | b |
| `keywords/cup.mp3` | c |
| `keywords/duck.mp3` | d |
| `keywords/fox.mp3` | f |
| `keywords/goat.mp3` | g |
| `keywords/hat.mp3` | h |
| `keywords/jar.mp3` | j |
| `keywords/kid.mp3` | k |
| `keywords/log.mp3` | l |
| `keywords/mop.mp3` | m |
| `keywords/nest.mp3` | n |
| `keywords/pig.mp3` | p |
| `keywords/queen.mp3` | qu |
| `keywords/rug.mp3` | r |
| `keywords/sun.mp3` | s |
| `keywords/top.mp3` | t |
| `keywords/van.mp3` | v |
| `keywords/wig.mp3` | w |
| `keywords/box.mp3` | x |
| `keywords/yarn.mp3` | y |
| `keywords/zebra.mp3` | z |
| `keywords/ship.mp3` | sh |
| `keywords/chick.mp3` | ch |
| `keywords/thumb.mp3` | th |
| `keywords/whale.mp3` | wh |
| `keywords/sock.mp3` | ck |
| `keywords/ring.mp3` | ng |
| `keywords/skunk.mp3` | nk |
| `keywords/rain.mp3` | ai |
| `keywords/hay.mp3` | ay |
| `keywords/bee.mp3` | ee |
| `keywords/leaf.mp3` | ea |
| `keywords/boat.mp3` | oa |
| `keywords/light.mp3` | igh |
| `keywords/cake.mp3` | a_e |
| `keywords/kite.mp3` | i_e |
| `keywords/bone.mp3` | o_e |
| `keywords/cube.mp3` | u_e |
| `keywords/moon.mp3` | oo |
| `keywords/cow.mp3` | ow |
| `keywords/cloud.mp3` | ou |
| `keywords/oil.mp3` | oi |
| `keywords/toy.mp3` | oy |
| `keywords/car.mp3` | ar |
| `keywords/corn.mp3` | or |
| `keywords/tiger.mp3` | er |
| `keywords/bird.mp3` | ir |
| `keywords/turtle.mp3` | ur |

## Words (973)

Each is `words/<word>.mp3`, said from its tiles' sounds. The list is `js/words.js`.

Real words (705): aid, aim, am, an, ape, arch, ark, arm, art, at, ate, ax, back, bad, bag, bait, bake, bale, bang, bank, bar, bark, barn, base, bat, bath, bay, beach, bead, beak, beam, bean, beat, bed, bee, beef, beep, beet, beg, bet, bib, bid, big, bike, bin, bird, birth, bit, bite, boat, boil, bone, boo, boom, boot, booth, born, bout, box, boy, bud, bug, bun, bunk, burn, burp, bus, but, cab, cake, came, can, cane, cap, cape, car, card, cart, case, cash, cat, cave, chain, chap, charm, chat, cheap, check, cheek, chick, chime, chin, chip, chirp, chop, chug, chum, chunk, coach, coal, coat, cob, cod, code, cog, coil, coin, cone, cool, coop, cop, cord, cork, corn, cot, couch, cove, cow, coy, cub, cube, cup, curb, curd, curl, cut, cute, dad, dark, dart, dash, date, day, deal, deck, deed, deep, den, did, dig, dim, dime, dine, dip, dirt, dish, dive, dock, dog, dome, dot, down, duck, dug, dunk, each, eat, eel, fade, fail, faith, fame, fan, fang, far, farm, fat, fax, fed, fee, feed, feel, feet, fern, fig, fight, file, fin, fine, fir, firm, fish, fit, five, fix, foal, foam, fog, foil, food, for, fork, form, fort, foul, fowl, fox, fume, fun, fur, gain, gale, game, gap, gas, gate, gave, get, gig, girl, goal, goat, gong, goo, goof, got, gown, gum, had, hail, ham, hang, hard, harm, harsh, hat, hay, heal, heap, heat, heed, heel, hen, her, herd, hid, hide, high, hike, him, hip, hit, hive, hog, hole, home, honk, hoop, hoot, hop, hope, horn, hot, how, howl, hug, hum, hung, hurl, hurt, hush, hut, if, in, it, jab, jack, jail, jam, jar, jay, jeep, jet, jig, job, jog, join, joke, jot, joy, jug, junk, keen, keep, keg, kick, kid, kin, king, kit, kite, lab, lack, lad, laid, lake, lane, lap, lark, late, lay, leaf, leak, lean, leap, leash, led, leg, let, lick, lid, life, light, like, lime, line, link, lip, lit, load, loaf, loan, lobe, lock, log, lone, long, loom, loop, loot, lot, loud, luck, lung, lush, mad, made, maid, mail, main, make, male, man, mane, map, march, mark, marsh, mash, mat, mate, math, may, meal, mean, meat, meet, men, mesh, met, might, mile, mine, mink, mix, moan, moat, mob, mode, mole, mom, moo, mood, moon, mop, mope, moth, mouth, much, mud, mug, mule, mush, mute, nag, nail, name, nap, neat, neck, need, net, night, nine, nod, noon, north, not, note, noun, now, nut, oak, oat, oath, oil, on, ouch, out, owl, ox, pack, pad, paid, pail, pain, pal, pale, pan, pane, park, part, pat, path, pay, pea, peach, peak, peck, peek, peel, peep, peg, pen, pep, perk, pet, pick, pig, pile, pin, pine, pink, pipe, pit, poach, pod, poke, pole, pool, pop, porch, pork, port, pot, pouch, pout, puck, pup, quack, quake, queen, quick, quit, quiz, rack, rag, raid, rail, rain, rake, ram, ran, rang, rank, rap, rash, rat, ray, reach, red, reed, reef, reel, rib, rich, rid, ride, rig, right, rim, ring, rink, rip, ripe, road, roam, rob, robe, rock, rod, rode, role, roof, room, root, rope, rot, rub, rug, run, rung, rush, sack, sad, safe, sag, sail, sale, same, sang, sank, sap, sat, save, say, sea, seal, seam, seat, see, seed, seek, seen, seep, set, shack, shade, shake, shark, shed, sheep, sheet, shin, shine, ship, shirt, shock, shop, short, shot, shout, shut, sick, side, sigh, sight, sing, sink, sip, sir, sit, site, six, soap, sob, sock, soil, sole, song, soon, sort, south, soy, sub, such, sum, sun, sung, sunk, surf, tab, tack, tad, tag, tail, take, tale, tame, tan, tank, tap, tape, tar, tart, tax, tea, teach, team, tee, teen, teeth, ten, term, thank, thick, thigh, thin, thing, think, third, thud, tick, tide, tight, tile, time, tin, tip, toad, toil, tone, too, tool, toot, tooth, top, torch, torn, tot, town, toy, tub, tuck, tug, turf, turn, up, us, vain, van, vane, vase, vat, verb, vet, vex, vine, vote, vouch, vow, wade, wag, wail, wait, wake, wave, wax, way, weak, web, wed, week, weep, wet, whack, whale, wheat, wheel, when, which, while, whim, whip, whirl, white, whiz, wick, wide, wife, wig, win, wing, wink, wipe, wish, wit, woke, worn, wow, yak, yam, yank, yap, yard, yarn, yes, yet, yuck, yum, zap, zip, zone, zoo, zoom.

Made-up words (268; "ton" is "tahn"): baz, beb, bef, bem, benk, bep, besh, bip, bix, bup, ceb, ced, cem, ceng, cenk, cet, cex, cez, chag, chas, chash, chaz, chep, chim, chom, chonk, choth, chox, chup, chuz, cif, cim, cix, cug, deng, diz, dosh, doz, dus, dut, fank, fas, feng, fesh, fif, fim, fing, fith, fong, fonk, foth, fung, fup, fush, gach, gax, geb, gech, gef, geg, gex, gich, gix, gof, gom, gox, gung, guth, hab, heg, heng, hez, hig, hink, hith, hoch, hof, hosh, huth, jas, jech, jep, jick, jid, jish, jit, jith, jonk, jum, jung, jup, juth, lang, leb, lef, lep, lesh, leth, lig, lom, loth, luch, lud, lun, lup, lus, meb, menk, mep, mip, mof, mub, nank, nath, nen, nenk, nin, niz, nonk, nos, nung, nus, nush, nuz, pab, paf, pag, peb, pem, pesh, pib, pid, poch, pof, pum, quech, quem, queng, quex, quock, quom, quon, quos, quub, quuch, quum, quun, quus, quuz, reng, rin, rish, rith, roch, ronk, rop, ros, sath, seb, seng, senk, shaz, sheg, shenk, shesh, shig, shing, shos, shuf, shup, shuth, shuz, soch, soth, sush, sut, taz, teb, tenk, tep, tes, tet, thash, thech, theck, thed, theg, theth, thich, thid, thix, thom, thop, thuf, thux, thuz, tob, ton, tud, vach, vad, vap, vath, ved, vink, vix, viz, vob, vot, voz, vuf, vuth, wech, weg, weng, wenk, wep, wesh, weth, whad, whaf, whas, whash, whech, whep, whes, whex, whib, whis, whof, whub, whuck, whuf, wos, wox, wub, wuf, wum, wung, wunk, yach, yaf, yash, yef, yem, yich, yick, yit, yong, yonk, yosh, yoth, yug, yuz, zang, zash, zeck, zef, zenk, zes, zim, zish, zix, zob, zom, zop, zug, zun.

## Sentences (117)

| File | Say |
| --- | --- |
| `sentences/bag.mp3` | My lunch is in the bag. |
| `sentences/bath.mp3` | I take a bath at night. |
| `sentences/beach.mp3` | We dig in the sand at the beach. |
| `sentences/bed.mp3` | I go to bed at night. |
| `sentences/bee.mp3` | The bee buzzes by. |
| `sentences/big.mp3` | The whale is big. |
| `sentences/bike.mp3` | I ride my bike. |
| `sentences/bird.mp3` | The bird sings in the tree. |
| `sentences/boat.mp3` | The boat floats on the lake. |
| `sentences/bone.mp3` | The dog has a bone. |
| `sentences/box.mp3` | The toys are in the box. |
| `sentences/boy.mp3` | The boy runs to the park. |
| `sentences/bug.mp3` | A bug is on the leaf. |
| `sentences/bus.mp3` | We ride the bus to school. |
| `sentences/cake.mp3` | We eat cake at the party. |
| `sentences/can.mp3` | The soup is in a can. |
| `sentences/cap.mp3` | He has a red cap. |
| `sentences/car.mp3` | Dad drives the car. |
| `sentences/cat.mp3` | The cat naps in the sun. |
| `sentences/chick.mp3` | The chick is small and yellow. |
| `sentences/chip.mp3` | I ate a chip. |
| `sentences/coat.mp3` | Put on your coat. |
| `sentences/cod.mp3` | A cod is a fish. |
| `sentences/cog.mp3` | A cog is a wheel with teeth. |
| `sentences/coin.mp3` | I put a coin in my bank. |
| `sentences/corn.mp3` | We eat corn for lunch. |
| `sentences/cot.mp3` | I can nap on a cot. |
| `sentences/cow.mp3` | The cow says moo. |
| `sentences/cube.mp3` | Put an ice cube in the cup. |
| `sentences/cup.mp3` | I drink milk from a cup. |
| `sentences/dad.mp3` | Dad gives me a hug. |
| `sentences/did.mp3` | I did it! |
| `sentences/dig.mp3` | We dig in the sand. |
| `sentences/dish.mp3` | Put the dish in the sink. |
| `sentences/dog.mp3` | The dog wags its tail. |
| `sentences/dot.mp3` | Draw a big red dot. |
| `sentences/duck.mp3` | The duck swims in the pond. |
| `sentences/fan.mp3` | The fan keeps us cool. |
| `sentences/farm.mp3` | The cow lives on a farm. |
| `sentences/feet.mp3` | I have two feet. |
| `sentences/fish.mp3` | The fish swims fast. |
| `sentences/food.mp3` | The dog wants food. |
| `sentences/fork.mp3` | Eat with a fork. |
| `sentences/fox.mp3` | The fox has a red tail. |
| `sentences/fur.mp3` | The cat has soft fur. |
| `sentences/game.mp3` | Let us play a game. |
| `sentences/gig.mp3` | The band plays a gig. |
| `sentences/girl.mp3` | The girl kicks the ball. |
| `sentences/got.mp3` | I got a new hat. |
| `sentences/hat.mp3` | Put on your hat. |
| `sentences/hay.mp3` | The horse eats hay. |
| `sentences/hen.mp3` | The hen sits on her eggs. |
| `sentences/home.mp3` | We go home after school. |
| `sentences/horn.mp3` | Toot the horn! |
| `sentences/hot.mp3` | The sun is hot. |
| `sentences/hug.mp3` | Give me a big hug. |
| `sentences/jam.mp3` | I like jam on my toast. |
| `sentences/jar.mp3` | The jam is in a jar. |
| `sentences/jet.mp3` | The jet flies up high. |
| `sentences/king.mp3` | The king has a crown. |
| `sentences/kite.mp3` | The kite flies in the wind. |
| `sentences/leaf.mp3` | A leaf fell from the tree. |
| `sentences/leg.mp3` | I hop on one leg. |
| `sentences/lid.mp3` | Put the lid on the pot. |
| `sentences/light.mp3` | Turn on the light. |
| `sentences/log.mp3` | The frog sits on a log. |
| `sentences/map.mp3` | The map shows the way. |
| `sentences/moon.mp3` | The moon is bright. |
| `sentences/mop.mp3` | Mop up the mess. |
| `sentences/mouth.mp3` | Open your mouth wide. |
| `sentences/mud.mp3` | The pig rolls in the mud. |
| `sentences/net.mp3` | Catch the ball in the net. |
| `sentences/night.mp3` | The moon comes out at night. |
| `sentences/nine.mp3` | I am nine years old. |
| `sentences/nod.mp3` | Nod your head to say yes. |
| `sentences/not.mp3` | The soup is not hot. |
| `sentences/nut.mp3` | The squirrel has a nut. |
| `sentences/oil.mp3` | Mom cooks with oil. |
| `sentences/owl.mp3` | The owl hoots at night. |
| `sentences/pan.mp3` | Mom cooks eggs in a pan. |
| `sentences/path.mp3` | We walk on the path. |
| `sentences/pen.mp3` | I write with a pen. |
| `sentences/pig.mp3` | The pig rolls in the mud. |
| `sentences/pot.mp3` | The soup is in the pot. |
| `sentences/quack.mp3` | The duck says quack. |
| `sentences/rain.mp3` | The rain makes puddles. |
| `sentences/rat.mp3` | The rat runs fast. |
| `sentences/ring.mp3` | She has a gold ring. |
| `sentences/rock.mp3` | I sit on a big rock. |
| `sentences/rope.mp3` | We jump with a rope. |
| `sentences/rug.mp3` | The cat naps on the rug. |
| `sentences/shark.mp3` | A shark swims in the sea. |
| `sentences/sheep.mp3` | The sheep says baa. |
| `sentences/ship.mp3` | The ship sails on the sea. |
| `sentences/shirt.mp3` | I have a blue shirt. |
| `sentences/shop.mp3` | We shop for food. |
| `sentences/sing.mp3` | We sing a song. |
| `sentences/six.mp3` | I have six crayons. |
| `sentences/soap.mp3` | Wash your hands with soap. |
| `sentences/sock.mp3` | I have one red sock. |
| `sentences/sun.mp3` | The sun is up. |
| `sentences/tad.mp3` | Add a tad of salt. (A tad means a little bit.) |
| `sentences/tag.mp3` | The tag is on the gift. |
| `sentences/tail.mp3` | The dog wags its tail. |
| `sentences/tan.mp3` | The sand is tan. |
| `sentences/tea.mp3` | Grandma drinks hot tea. |
| `sentences/tin.mp3` | The cookies are in a tin. |
| `sentences/tot.mp3` | A tot is a little kid. |
| `sentences/toy.mp3` | The toy is in the box. |
| `sentences/turn.mp3` | It is your turn. |
| `sentences/van.mp3` | We ride in the van. |
| `sentences/wave.mp3` | Wave to your friend. |
| `sentences/web.mp3` | The spider made a web. |
| `sentences/wig.mp3` | The clown has a funny wig. |
| `sentences/wing.mp3` | The bird has a wing. |
| `sentences/zip.mp3` | Zip up your coat. |
| `sentences/zoo.mp3` | We see lions at the zoo. |
