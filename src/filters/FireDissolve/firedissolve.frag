shader_type canvas_item;

// Use a NoiseTexture2D
uniform sampler2D noise_texture;
// Use a GradientTexture1D
uniform sampler2D burn_texture;

// Change this value to dissolve the object
uniform float integrity: hint_range(0.0, 1.0) = 1.0;
// How large the burn is
uniform float burn_size: hint_range(1.0, 1.5) = 1.3;

// Inverse lerp function
// Converts the value v from the range [a, b] to the range [0, 1]
float inverse_lerp(float a, float b, float v) {
    return (v - a) / (b - a);
}

// Called for every pixel the material is visible on
void fragment() {
    // Sample the noise texture
    // Multiply by UV.y to scale the effect vertically
    // Use (1.0 - UV.y) to change direction or UV.x for horizontal
    float noise = texture(noise_texture, UV).r * UV.y;
    // Sample the base color of the texture
    // The step function returns 1 when integrity > noise or 0 when integrity < noise
    vec4 base_color = texture(TEXTURE, UV) * step(noise, integrity);
    // Compute the UVs for the burn texture
    // Covert the range [integrity, integrity * burn_size] to a [0.0, 1.0] range
    vec2 burn_uv = vec2(inverse_lerp(integrity, integrity * burn_size, noise), 0.0);
    // Sample the burn texture using a higher edge in the step function
    vec4 burn_color = texture(burn_texture, burn_uv) * step(noise, integrity * burn_size);
    // Lerp between the end colors
    COLOR = mix(burn_color, base_color, base_color.a);
}
