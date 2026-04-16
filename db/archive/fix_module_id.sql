-- Fix the module_id to align with the canonical registry ID
UPDATE public.modules_content
SET module_id = 'spm-en-social-media'
WHERE module_id = 'english-spm-social-media';
