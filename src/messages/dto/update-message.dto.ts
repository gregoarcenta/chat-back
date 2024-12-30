import { PartialType } from '@nestjs/mapped-types';
import { MessageDto } from './create-message.dto';

export class UpdateMessageDto extends PartialType(MessageDto) {}
