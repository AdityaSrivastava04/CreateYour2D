from manim import *

class video(Scene):
    def construct(self):
        # 1. Display initial variable states
        a_label = Text("a =", font_size=60).to_corner(UL)
        a_val_initial = Text("10", font_size=60, color=BLUE).next_to(a_label, RIGHT, buff=0.2)
        
        b_label = Text("b =", font_size=60).next_to(a_label, DOWN * 2, buff=1, aligned_edge=LEFT)
        b_val_initial = Text("20", font_size=60, color=PURPLE).next_to(b_label, RIGHT, buff=0.2)

        self.play(
            Write(a_label),
            Write(a_val_initial),
            Write(b_label),
            Write(b_val_initial)
        )
        self.wait(1)

        # 2. Display the Python swap code
        swap_code = Text("a, b = b, a", font_size=48, color=YELLOW).to_edge(UP)
        self.play(Write(swap_code))
        self.wait(1.5)

        # 3. Animate the values swapping visually

        # Create copies of the initial values to show them moving
        a_val_moving = a_val_initial.copy()
        b_val_moving = b_val_initial.copy()

        # Fade out the original value texts as if they are 'taken' from their places
        self.play(
            FadeOut(a_val_initial, shift=LEFT * 0.5), # Slight shift to indicate removal
            FadeOut(b_val_initial, shift=LEFT * 0.5),
            run_time=0.8
        )
        self.wait(0.5)

        # Animate the copies moving to each other's original value positions
        self.play(
            a_val_moving.animate.move_to(b_val_initial.get_center()),
            b_val_moving.animate.move_to(a_val_initial.get_center()),
            run_time=1.8,
            rate_func=smooth # Smooth movement for visual appeal
        )
        self.wait(0.8)

        # Create the final new values at their respective locations
        # These are the *correct* final values for 'a' and 'b'
        a_val_final = Text("20", font_size=60, color=GREEN).move_to(a_val_initial.get_center())
        b_val_final = Text("10", font_size=60, color=GREEN).move_to(b_val_initial.get_center())

        # Fade out the moving copies as the new, correct values fade in
        self.play(
            FadeOut(a_val_moving, target_position=a_val_final.get_center()), # '10' moving to b's spot fades out
            FadeOut(b_val_moving, target_position=b_val_final.get_center()), # '20' moving to a's spot fades out
            FadeIn(a_val_final), # New '20' appears at a's spot
            FadeIn(b_val_final), # New '10' appears at b's spot
            run_time=1
        )

        self.wait(2)